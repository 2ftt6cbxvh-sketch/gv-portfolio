import { prisma } from "@/lib/prisma";

export async function sendSecurityAlert({ type, details, ip = "127.0.0.1", userAgent = "Unknown Device" }) {
  try {
    // 1. Fetch Telegram Config from DB
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let config = {
      telegramBotToken: "",
      telegramChatId: "",
      enableAlerts: true,
    };

    if (flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.telegramBotToken) config.telegramBotToken = String(parsed.telegramBotToken).trim();
        if (parsed.telegramChatId) config.telegramChatId = String(parsed.telegramChatId).trim();
        if (typeof parsed.enableAlerts === "boolean") config.enableAlerts = parsed.enableAlerts;
      } catch (e) {}
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const cleanUserAgent = userAgent.replace(/[<>&]/g, "").slice(0, 50);

    // 2. Format Custom Intrusion Warning Message (Using HTML format for 100% Telegram reliability)
    let title = "🚨 <b>SECURITY INTRUSION WARNING</b>";
    if (type === "UNAUTHORIZED_URL_ACCESS") title = "🚨 <b>INTRUSION: UNAUTHORIZED URL ACCESS (/admin)</b>";
    else if (type === "VPN_ACCESS_BLOCKED") title = "🚫 <b>SECURITY: VPN / PROXY ACCESS ATTEMPT BLOCKED</b>";
    else if (type === "SUCCESSFUL_URL_KEY_ACCESS") title = "🔑 <b>SECURITY: SUCCESSFUL DIRECT URL KEY ACCESS (/admin?key=...)</b>";
    else if (type === "FAILED_PASSWORD_ATTEMPT") title = "🚨 <b>INTRUSION: WRONG ADMIN PASSWORD ENTERED</b>";
    else if (type === "FAILED_PIN_ATTEMPT") title = "🚨 <b>INTRUSION: WRONG 6-DIGIT KEYPAD PIN</b>";
    else if (type === "FAILED_2FA_ATTEMPT") title = "🚨 <b>INTRUSION: WRONG 6-DIGIT TOTP 2FA CODE</b>";
    else if (type === "STAR_PATTERN_MISMATCH") title = "⚠️ <b>SECURITY ALERT: WRONG STAR PATTERN TAPPED</b>";
    else if (type === "RATE_LIMIT_EXCEEDED") title = "🚨 <b>CRITICAL BOT ATTACK: IP RATE LIMIT EXCEEDED</b>";
    else if (type === "LOCKDOWN_PAGE_TRIGGERED") title = "🚨 <b>CRITICAL LOCKDOWN: 90s SIREN & STROBE TRIGGERED</b>";
    else if (type === "UNAUTHORIZED_API_CALL") title = "🚨 <b>INTRUSION: UNAUTHORIZED API CALL (/api/admin)</b>";

    const alertMsg = `${title}\n\n` +
      `<b>Event</b>: <code>${details || type}</code>\n` +
      `<b>IP Address</b>: <code>${ip}</code>\n` +
      `<b>Device</b>: <code>${cleanUserAgent}</code>\n` +
      `<b>Time (IST)</b>: <code>${timestamp}</code>\n` +
      `<b>Status</b>: Security Telemetry Logged`;

    // 3. Awaited Dispatch Telegram Webhook Push Notification (Crucial for Vercel Serverless!)
    if (config.enableAlerts && config.telegramBotToken && config.telegramChatId) {
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: alertMsg,
          parse_mode: "HTML",
        }),
      });
    }

    // 4. Save Security Log to PostgreSQL Database
    const logEntry = {
      id: Date.now(),
      type,
      details,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      status: type.includes("SUCCESS") ? "SUCCESS" : "FAILED",
    };

    const logsFlag = await prisma.featureFlag.findUnique({
      where: { key: "security_audit_logs" },
    });

    let currentLogs = [];
    if (logsFlag?.metadata) {
      try {
        currentLogs = JSON.parse(logsFlag.metadata);
      } catch (e) {}
    }

    currentLogs.unshift(logEntry);
    if (currentLogs.length > 100) currentLogs = currentLogs.slice(0, 100);

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
