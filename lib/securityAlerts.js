import { prisma } from "@/lib/prisma";
import { getDetailedTelemetry } from "@/lib/telemetry";

export async function sendSecurityAlert({ type, details, ip = "127.0.0.1", userAgent = "Unknown Device" }) {
  try {
    // 1. Fetch Telegram Config from DB (with process.env fallback)
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let config = {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
      telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
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

    // Fetch ultra-detailed Telemetry & GPS Pin data
    const telemetry = await getDetailedTelemetry(ip, userAgent);

    // 2. Format Custom Intrusion Warning Message (HTML format)
    let title = "🚨 <b>SECURITY INTRUSION WARNING</b>";
    if (type === "UNAUTHORIZED_URL_ACCESS") title = "🚨 <b>INTRUSION: UNAUTHORIZED URL ACCESS (/admin)</b>";
    else if (type === "UNAUTHORIZED_GEO_ACCESS") title = "🌐 <b>GEO-FENCE BLOCKED: ACCESS OUTSIDE INDIA RESTRICTED</b>";
    else if (type === "VPN_ACCESS_BLOCKED") title = "🚫 <b>SECURITY: VPN / PROXY ACCESS ATTEMPT BLOCKED</b>";
    else if (type === "SUCCESSFUL_URL_KEY_ACCESS") title = "🔑 <b>SECURITY: SUCCESSFUL DIRECT URL KEY ACCESS (/admin?key=...)</b>";
    else if (type === "FAILED_PASSWORD_ATTEMPT") title = "🚨 <b>INTRUSION: WRONG ADMIN PASSWORD ENTERED</b>";
    else if (type === "FAILED_PIN_ATTEMPT") title = "🚨 <b>INTRUSION: WRONG 6-DIGIT KEYPAD PIN</b>";
    else if (type === "FAILED_2FA_ATTEMPT") title = "🚨 <b>INTRUSION: WRONG 6-DIGIT TOTP 2FA CODE</b>";
    else if (type === "STAR_PATTERN_MISMATCH") title = "⚠️ <b>SECURITY ALERT: WRONG STAR PATTERN TAPPED</b>";
    else if (type === "RATE_LIMIT_EXCEEDED") title = "🚨 <b>CRITICAL BOT ATTACK: IP RATE LIMIT EXCEEDED</b>";
    else if (type === "LOCKDOWN_PAGE_TRIGGERED") title = "🚨 <b>CRITICAL LOCKDOWN: 90s SIREN & STROBE TRIGGERED</b>";
    else if (type === "HONEYPOT_TRAP_TRIGGERED") title = "🍯 <b>HONEYPOT TRAP: ATTACKER ENTERED DUMMY TRAP PIN (999999)</b>";
    else if (type === "UNAUTHORIZED_API_CALL") title = "🚨 <b>INTRUSION: UNAUTHORIZED API CALL (/api/admin)</b>";

    const mapsLink = telemetry.googleMapsUrl
      ? `\n📍 <b>GPS Pin</b>: <a href="${telemetry.googleMapsUrl}">View on Google Maps</a> (<code>${telemetry.coordinates}</code>)`
      : "";

    const alertMsg =
      `${title}\n\n` +
      `<b>Event</b>: <code>${details || type}</code>\n` +
      `<b>IP Address</b>: <code>${ip}</code>\n` +
      `<b>Location</b>: ${telemetry.location}${mapsLink}\n` +
      `<b>ISP / Network</b>: <code>${telemetry.isp}</code>\n` +
      `<b>Autonomous System</b>: <code>${telemetry.asOrg}</code>\n` +
      `<b>Location Integrity</b>: <b>${telemetry.integrityStatus}</b>\n` +
      `<b>Device Hardware</b>: <code>${telemetry.device.summary}</code>\n` +
      `<b>Time (IST)</b>: <code>${timestamp}</code>\n` +
      `<b>Status</b>: Security Telemetry Logged`;

    // 3. Dispatch Telegram Push Notification
    if (config.enableAlerts && config.telegramBotToken && config.telegramChatId) {
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: alertMsg,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      }).catch(() => {});
    }

    // 4. Save Security Log to PostgreSQL Database
    const logEntry = {
      id: Date.now(),
      type,
      details,
      ip,
      location: telemetry.location,
      coordinates: telemetry.coordinates,
      googleMapsUrl: telemetry.googleMapsUrl,
      isp: telemetry.isp,
      asOrg: telemetry.asOrg,
      integrityStatus: telemetry.integrityStatus,
      device: telemetry.device.summary,
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
  } catch (e) {
    console.error("sendSecurityAlert error:", e);
  }
}
