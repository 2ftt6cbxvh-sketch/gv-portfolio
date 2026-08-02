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
        if (parsed.telegramBotToken) config.telegramBotToken = parsed.telegramBotToken;
        if (parsed.telegramChatId) config.telegramChatId = parsed.telegramChatId;
        if (typeof parsed.enableAlerts === "boolean") config.enableAlerts = parsed.enableAlerts;
      } catch (e) {}
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // 2. Format Custom Intrusion Warning Message
    let title = "🚨 *SECURITY INTRUSION WARNING*";
    if (type === "UNAUTHORIZED_URL_ACCESS") title = "🚨 *INTRUSION: UNAUTHORIZED URL ACCESS (/admin)*";
    else if (type === "FAILED_PASSWORD_ATTEMPT") title = "🚨 *INTRUSION: WRONG ADMIN PASSWORD ENTERED*";
    else if (type === "FAILED_PIN_ATTEMPT") title = "🚨 *INTRUSION: WRONG 6-DIGIT KEYPAD PIN*";
    else if (type === "STAR_PATTERN_MISMATCH") title = "⚠️ *SECURITY ALERT: WRONG STAR PATTERN TAPPED*";
    else if (type === "RATE_LIMIT_EXCEEDED") title = "🚨 *CRITICAL BOT ATTACK: IP RATE LIMIT EXCEEDED*";
    else if (type === "LOCKDOWN_PAGE_TRIGGERED") title = "🚨 *CRITICAL LOCKDOWN: 90s SIREN & STROBE TRIGGERED*";
    else if (type === "UNAUTHORIZED_API_CALL") title = "🚨 *INTRUSION: UNAUTHORIZED API CALL (/api/admin)*";

    const alertMsg = `${title}\n\n` +
      `*Event*: \`${details || type}\`\n` +
      `*IP Address*: \`${ip}\`\n` +
      `*Device*: \`${userAgent.slice(0, 45)}\`\n` +
      `*Time (IST)*: \`${timestamp}\`\n` +
      `*Status*: Security Telemetry Logged`;

    // 3. Dispatch Telegram Webhook Push Notification
    if (config.enableAlerts && config.telegramBotToken && config.telegramChatId) {
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: alertMsg,
          parse_mode: "Markdown",
        }),
      }).catch(() => {});
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
