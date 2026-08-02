import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendSecurityAlert } from "@/lib/securityAlerts";

function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

const DEFAULT_KEY_HASH = sha256("134214");
const DEFAULT_PIN_HASH = sha256("134214");
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

    let config = {
      adminSecretKey: "134214",
      pinCode: "134214",
      sequenceStr: "1,2,3,4,1,3",
      telegramBotToken: "",
      telegramChatId: "",
      enableAlerts: true,
    };

    if (flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.adminSecretKey) config.adminSecretKey = parsed.adminSecretKey;
        if (parsed.pinCode) config.pinCode = parsed.pinCode;
        if (parsed.sequenceStr && !parsed.sequenceStr.includes("1,3,4,2,1,4")) {
          config.sequenceStr = parsed.sequenceStr;
        }
        if (parsed.telegramBotToken) config.telegramBotToken = String(parsed.telegramBotToken).trim();
        if (parsed.telegramChatId) config.telegramChatId = String(parsed.telegramChatId).trim();
        if (typeof parsed.enableAlerts === "boolean") config.enableAlerts = parsed.enableAlerts;
      } catch (e) {}
    }

    const body = await req.json();
    const { type, payload } = body;

    // Test Alert Handler
    if (type === "test_telegram_alert") {
      await sendSecurityAlert({
        type: "TEST_TELEGRAM_NOTIFICATION",
        details: "🧪 Test Security Notification from GV Admin Panel",
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, message: "Test alert dispatched to Telegram!" });
    }

    // Handle Unauthorized Direct URL Access Alert (/admin)
    if (type === "unauthorized_url") {
      await sendSecurityAlert({
        type: "UNAUTHORIZED_URL_ACCESS",
        details: `Direct access attempt to restricted path: ${payload || "/admin"}`,
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, logged: true });
    }

    // Handle Instant Pattern Mismatch Alert (1st wrong star tap)
    if (type === "pattern_mismatch") {
      await sendSecurityAlert({
        type: "STAR_PATTERN_MISMATCH",
        details: "Visitor tapped incorrect star pattern sequence",
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, logged: true });
    }

    // Handle Instant Lockdown Alert (When Warning Page is Triggered)
    if (type === "lockdown_triggered") {
      await sendSecurityAlert({
        type: "LOCKDOWN_PAGE_TRIGGERED",
        details: "90s Cyber Strobe Warning Modal & Siren Triggered",
        ip,
        userAgent,
      });
      return NextResponse.json({ success: true, logged: true });
    }

    // Rate Limit Check for Authentication API
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

    if (!payload) {
      return NextResponse.json({ success: false, error: "Missing payload" }, { status: 400 });
    }

    let targetKeyHash = sha256(config.adminSecretKey);
    let targetPinHash = sha256(config.pinCode);
    let targetSeqHash = sha256(config.sequenceStr);

    const payloadHash = sha256(payload);
    let isValid = false;

    if (type === "key") {
      isValid = payloadHash === targetKeyHash;
    } else if (type === "pin") {
      isValid = payloadHash === targetPinHash;
    } else if (type === "pattern") {
      isValid = payloadHash === targetSeqHash;
    }

    if (!isValid) {
      if (type === "pin") {
        await sendSecurityAlert({
          type: "FAILED_PIN_ATTEMPT",
          details: "Failed 6-digit keypad PIN attempt",
          ip,
          userAgent,
        });
      }

      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const expiresAt = Date.now() + 3 * 60 * 1000;
    const tokenData = JSON.stringify({ verified: true, expiresAt });
    const token = Buffer.from(tokenData).toString("base64");

    const response = NextResponse.json({ success: true, expiresAt, secretKey: config.adminSecretKey });

    response.cookies.set("starPatternVerified", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 180,
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
