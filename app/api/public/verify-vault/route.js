import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import argon2 from "argon2";
import { sendSecurityAlert } from "@/lib/securityAlerts";
import { verifyTOTP } from "@/lib/totp";
import { check24HourRateLimit } from "@/lib/rateLimit";

function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

const DEFAULT_PIN_ARGON2 = "$argon2id$v=19$m=65536,t=3,p=1$4K8wz5w9R1f9J+J3g2Q4vA$L1R2/Y2kZ5Y2e2F2b2c2d2e2f2g2h2i2j2k2l2m2n2o"; 
const DEFAULT_PIN_BCRYPT = "$2a$12$x8hpnwZyqUIkEzTFBbCvAOKNN.8SnQf9GZmZMOJ.VmY2bdvAkQk5.";
const DEFAULT_KEY_HASH = sha256("134214");
const DEFAULT_SEQ_HASH = sha256("1,2,3,4,1,3");

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Device";

    // Fetch feature flag config from DB
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let configHashes = {
      pinHash: DEFAULT_PIN_BCRYPT,
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

    // Direct Unauthorized URL Access Handler
    if (type === "unauthorized_url") {
      await sendSecurityAlert({
        type: "UNAUTHORIZED_URL_ACCESS",
        details: `Direct address bar access attempt to /admin: ${payload || "Direct URL"}`,
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, logged: true });
    }

    // 24-Hour Persistent IP Rate Limit Check (PostgreSQL / Cold-Start Persistent)
    const rateCheck = await check24HourRateLimit(ip);
    if (!rateCheck.allowed) {
      const hoursRemaining = (rateCheck.remainingSeconds / 3600).toFixed(1);
      await sendSecurityAlert({
        type: "RATE_LIMIT_EXCEEDED",
        details: `IP BLOCKED FOR 24 HOURS (5 failed attempts in 24h). Try again in ${hoursRemaining} hours.`,
        ip,
        userAgent,
      });

      return NextResponse.json(
        { error: `24-Hour Security Block Active. Exceeded 5 attempts in 24 hours. Try again in ${hoursRemaining} hours.` },
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
      const pinStr = String(payload);
      // Check Argon2id hash first
      if (configHashes.pinHash.startsWith("$argon2")) {
        try {
          isValid = await argon2.verify(configHashes.pinHash, pinStr);
        } catch (e) {
          isValid = false;
        }
      }
      // Check bcrypt hash fallback
      else if (configHashes.pinHash.startsWith("$2a$") || configHashes.pinHash.startsWith("$2b$")) {
        isValid = await bcrypt.compare(pinStr, configHashes.pinHash);
      } else {
        isValid = payloadHash === configHashes.pinHash;
      }
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
          details: `Failed 6-digit keypad PIN attempt (Attempt ${rateCheck.count}/5 in 24h)`,
          ip,
          userAgent,
        });
      } else if (type === "totp") {
        await sendSecurityAlert({
          type: "FAILED_2FA_ATTEMPT",
          details: `Failed 6-digit TOTP 2FA code attempt (Attempt ${rateCheck.count}/5 in 24h)`,
          ip,
          userAgent,
        });
      } else if (type === "key") {
        await sendSecurityAlert({
          type: "UNAUTHORIZED_URL_ACCESS",
          details: `Failed direct URL key attempt: /admin?key=${payload}`,
          ip,
          userAgent,
        });
      }

      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // If type === 'key' succeeded, send alert
    if (type === "key") {
      await sendSecurityAlert({
        type: "SUCCESSFUL_URL_KEY_ACCESS",
        details: `Successful direct URL key access: /admin?key=${payload}`,
        ip,
        userAgent,
      });
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
