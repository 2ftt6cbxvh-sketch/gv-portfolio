import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

const DEFAULT_KEY_HASH = sha256("134214");
const DEFAULT_PIN_HASH = sha256("134214");
const DEFAULT_SEQ_HASH = sha256("1,3,4,2,1,4");

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

// Telegram Real-Time Security Alert Webhook Dispatcher
async function sendTelegramAlert(botToken, chatId, message) {
  if (!botToken || !chatId) return;
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {}
}

// Helper to Persist Security Audit Log into Database (PostgreSQL)
async function recordDatabaseSecurityLog(event) {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "security_audit_logs" },
    });

    let currentLogs = [];
    if (flag?.metadata) {
      try {
        currentLogs = JSON.parse(flag.metadata);
      } catch (e) {}
    }

    currentLogs.unshift(event);
    if (currentLogs.length > 100) {
      currentLogs = currentLogs.slice(0, 100);
    }

    await prisma.featureFlag.upsert({
      where: { key: "security_audit_logs" },
      update: { metadata: JSON.stringify(currentLogs) },
      create: {
        key: "security_audit_logs",
        name: "Security Audit Logs",
        enabled: true,
        metadata: JSON.stringify(currentLogs),
      },
    });
  } catch (e) {}
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
      sequenceStr: "1,3,4,2,1,4",
      telegramBotToken: "",
      telegramChatId: "",
      enableAlerts: true,
    };

    if (flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.adminSecretKey) config.adminSecretKey = parsed.adminSecretKey;
        if (parsed.pinCode) config.pinCode = parsed.pinCode;
        if (parsed.sequenceStr) config.sequenceStr = parsed.sequenceStr;
        if (parsed.telegramBotToken) config.telegramBotToken = parsed.telegramBotToken;
        if (parsed.telegramChatId) config.telegramChatId = parsed.telegramChatId;
        if (typeof parsed.enableAlerts === "boolean") config.enableAlerts = parsed.enableAlerts;
      } catch (e) {}
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
      const alertMsg = `⚠️ *SECURITY ALERT // WRONG STAR PATTERN TAPPED*\n\n` +
        `*Event*: Visitor tapped incorrect star pattern sequence\n` +
        `*IP Address*: \`${ip}\`\n` +
        `*Time*: \`${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n` +
        `*Status*: Spell Sequence Reset`;

      if (config.enableAlerts && config.telegramBotToken && config.telegramChatId) {
        await sendTelegramAlert(config.telegramBotToken, config.telegramChatId, alertMsg);
      }

      await recordDatabaseSecurityLog({
        id: Date.now(),
        type: "STAR_PATTERN_MISMATCH",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        status: "FAILED",
      });

      return NextResponse.json({ success: true, logged: true });
    }

    // Handle Instant Lockdown Alert (When Warning Page is Triggered)
    if (type === "lockdown_triggered") {
      const alertMsg = `🚨 *CRITICAL LOCKDOWN ACTIVATED*\n\n` +
        `*Event*: 90s Cyber Strobe Warning Modal & Siren Triggered\n` +
        `*IP Address*: \`${ip}\`\n` +
        `*Time*: \`${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n` +
        `*Status*: 90s Siren & Strobe Modal Active on Visitor Device`;

      if (config.enableAlerts && config.telegramBotToken && config.telegramChatId) {
        await sendTelegramAlert(config.telegramBotToken, config.telegramChatId, alertMsg);
      }

      await recordDatabaseSecurityLog({
        id: Date.now(),
        type: "LOCKDOWN_PAGE_TRIGGERED",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        status: "LOCKDOWN",
      });

      return NextResponse.json({ success: true, logged: true });
    }

    // Rate Limit Check for Authentication API
    if (!checkRateLimit(ip)) {
      const alertMsg = `🚨 *SECURITY ALERT // RATE LIMIT EXCEEDED*\n\n` +
        `*IP Address*: \`${ip}\`\n` +
        `*Device*: \`${userAgent.slice(0, 40)}\`\n` +
        `*Time*: \`${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n` +
        `*Status*: 90s Cyber Strobe Lockdown Triggered`;

      if (config.enableAlerts && config.telegramBotToken && config.telegramChatId) {
        await sendTelegramAlert(config.telegramBotToken, config.telegramChatId, alertMsg);
      }

      await recordDatabaseSecurityLog({
        id: Date.now(),
        type: "RATE_LIMIT_EXCEEDED",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        status: "BLOCKED",
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

    await recordDatabaseSecurityLog({
      id: Date.now(),
      type: `${type.toUpperCase()}_ATTEMPT`,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      status: isValid ? "SUCCESS" : "FAILED",
    });

    if (!isValid) {
      if (type === "pin" && config.enableAlerts && config.telegramBotToken && config.telegramChatId) {
        const alertMsg = `🚨 *SECURITY INTRUSION WARNING*\n\n` +
          `*Type*: Failed 6-Digit PIN Attempt\n` +
          `*IP Address*: \`${ip}\`\n` +
          `*Time*: \`${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n` +
          `*Status*: Strike Counter Incremented`;

        await sendTelegramAlert(config.telegramBotToken, config.telegramChatId, alertMsg);
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
