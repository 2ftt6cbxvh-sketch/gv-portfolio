import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendSecurityAlert } from "@/lib/securityAlerts";
import { verifyTOTP } from "@/lib/totp";

function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

const DEFAULT_PIN_HASH = sha256("180296");
const DEFAULT_KEY_HASH = sha256("134214");
const DEFAULT_SEQ_HASH = sha256("1,2,3,4,1,3");

const ipRateLimits = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const record = ipRateLimits.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count += 1;
  }

  ipRateLimits.set(ip, record);
  return record.count <= 5;
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Device";

    // Fetch feature flag config from DB
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let configHashes = {
      pinHash: DEFAULT_PIN_HASH,
      keyHash: DEFAULT_KEY_HASH,
      seqHash: DEFAULT_SEQ_HASH,
      rawSecretKey: "134214",
      totpSecret: "",
      is2FAEnabled: false,
    };

    if (flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.pinHash) configHashes.pinHash = parsed.pinHash;
        else if (parsed.pinCode) configHashes.pinHash = sha256(parsed.pinCode);

        if (parsed.secretKeyHash) configHashes.keyHash = parsed.secretKeyHash;
        else if (parsed.adminSecretKey) {
          configHashes.keyHash = sha256(parsed.adminSecretKey);
          configHashes.rawSecretKey = parsed.adminSecretKey;
        }

        if (parsed.sequenceStr && !parsed.sequenceStr.includes("1,3,4,2,1,4")) {
          configHashes.seqHash = sha256(parsed.sequenceStr);
        }

        if (parsed.totpSecret) configHashes.totpSecret = parsed.totpSecret;
        if (typeof parsed.is2FAEnabled === "boolean") configHashes.is2FAEnabled = parsed.is2FAEnabled;
      } catch (e) {}
    }

    const body = await req.json();
    const { type, payload, totpCode } = body;

    // Test Alert Handler
    if (type === "test_telegram_alert") {
      await sendSecurityAlert({
        type: "TEST_TELEGRAM_NOTIFICATION",
        details: "🧪 Test Security Notification from GV Admin Panel",
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, message: "Test alert dispatched" });
    }

    // Pattern Mismatch Alert Handler
    if (type === "pattern_mismatch") {
      await sendSecurityAlert({
        type: "STAR_PATTERN_MISMATCH",
        details: "Visitor tapped incorrect star pattern sequence",
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, logged: true });
    }

    // Instant Lockdown Alert Handler
    if (type === "lockdown_triggered") {
      await sendSecurityAlert({
        type: "LOCKDOWN_PAGE_TRIGGERED",
        details: "90s Cyber Strobe Warning Modal & Siren Triggered",
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, logged: true });
    }

    // Rate Limit Check
    if (!checkRateLimit(ip)) {
      await sendSecurityAlert({
        type: "RATE_LIMIT_EXCEEDED",
        details: "IP address sent > 5 auth requests in 5 minutes",
        ip,
        userAgent,
      });

      return NextResponse.json(
        { error: "Rate limit exceeded. Too many attempts. Try again in 5 minutes." },
        { status: 429 }
      );
    }

    if (!payload && type !== "totp") {
      return NextResponse.json({ success: false, error: "Missing payload" }, { status: 400 });
    }

    const payloadHash = payload ? sha256(payload) : "";
    let isValid = false;

    if (type === "key") {
      isValid = payloadHash === configHashes.keyHash;
    } else if (type === "pin") {
      isValid = payloadHash === configHashes.pinHash;
    } else if (type === "pattern") {
      isValid = payloadHash === configHashes.seqHash;
    } else if (type === "totp") {
      if (configHashes.is2FAEnabled && configHashes.totpSecret) {
        isValid = verifyTOTP(configHashes.totpSecret, totpCode || payload);
      } else {
        isValid = true;
      }
    }

    if (!isValid) {
      if (type === "pin") {
        await sendSecurityAlert({
          type: "FAILED_PIN_ATTEMPT",
          details: "Failed 6-digit keypad PIN attempt",
          ip,
          userAgent,
        });
      } else if (type === "totp") {
        await sendSecurityAlert({
          type: "FAILED_2FA_ATTEMPT",
          details: "Failed 6-digit TOTP 2FA code attempt",
          ip,
          userAgent,
        });
      }

      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // If type === 'pin' and 2FA is enabled, require TOTP code in 2nd step
    if (type === "pin" && configHashes.is2FAEnabled && configHashes.totpSecret) {
      if (!totpCode) {
        return NextResponse.json({
          success: false,
          requires2FA: true,
          message: "PIN verified! Enter 6-digit code from Apple Passwords App / Authenticator.",
        });
      }

      const isTOTPValid = verifyTOTP(configHashes.totpSecret, totpCode);
      if (!isTOTPValid) {
        await sendSecurityAlert({
          type: "FAILED_2FA_ATTEMPT",
          details: "Failed 6-digit TOTP 2FA verification code after PIN entry",
          ip,
          userAgent,
        });
        return NextResponse.json({ success: false, error: "Invalid 2FA code" }, { status: 401 });
      }
    }

    const expiresAt = Date.now() + 3 * 60 * 1000;
    const tokenData = JSON.stringify({ verified: true, expiresAt });

    const response = NextResponse.json({
      success: true,
      secretKey: configHashes.rawSecretKey,
      token: sha256(tokenData),
    });

    response.cookies.set("starPatternVerified", sha256(tokenData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 180,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
