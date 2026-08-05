import { prisma } from "@/lib/prisma";

function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "🌐";
  }
}

async function getIpGeo(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { location: "Local Development Server", isp: "Internal Network", countryCode: "IN", flag: "🏠" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s fast timeout

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp`, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.status === "success") {
        const flag = getCountryFlag(data.countryCode);
        const cityRegion = [data.city, data.regionName].filter(Boolean).join(", ");
        const location = `${flag} ${cityRegion ? cityRegion + ", " : ""}${data.country}`;
        return {
          location,
          isp: data.isp || "Unknown Carrier",
          countryCode: data.countryCode || "UN",
          flag,
        };
      }
    }
  } catch (e) {}

  return { location: "Unknown Location", isp: "Unknown Carrier", countryCode: "UN", flag: "🌐" };
}

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
    const cleanUserAgent = userAgent.replace(/[<>&]/g, "").slice(0, 50);

    // Fetch live Geolocation data for IP
    const geo = await getIpGeo(ip);

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
    else if (type === "UNAUTHORIZED_API_CALL") title = "🚨 <b>INTRUSION: UNAUTHORIZED API CALL (/api/admin)</b>";

    const alertMsg = `${title}\n\n` +
      `<b>Event</b>: <code>${details || type}</code>\n` +
      `<b>IP Address</b>: <code>${ip}</code>\n` +
      `<b>Location</b>: ${geo.location}\n` +
      `<b>ISP / Carrier</b>: <code>${geo.isp}</code>\n` +
      `<b>Device</b>: <code>${cleanUserAgent}</code>\n` +
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
        }),
      });
    }

    // 4. Save Security Log to PostgreSQL Database
    const logEntry = {
      id: Date.now(),
      type,
      details,
      ip,
      location: geo.location,
      isp: geo.isp,
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
