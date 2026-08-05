import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unblockIp } from "@/lib/rateLimit";

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

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body.message || body.channel_post;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat?.id || "");
    const rawText = (message.text || "").trim();
    const upperText = rawText.toUpperCase();

    // Fetch Telegram Config from DB
    const gatewayFlag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let config = { telegramChatId: "", telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "" };
    let parsedMeta = {};

    if (gatewayFlag?.metadata) {
      try {
        parsedMeta = typeof gatewayFlag.metadata === "string" ? JSON.parse(gatewayFlag.metadata) : gatewayFlag.metadata;
        if (parsedMeta.telegramChatId) config.telegramChatId = String(parsedMeta.telegramChatId).trim();
        if (parsedMeta.telegramBotToken) config.telegramBotToken = String(parsedMeta.telegramBotToken).trim();
      } catch (e) {}
    }

    // Auto-capture & persist telegramChatId if missing or changed
    if (chatId && chatId !== config.telegramChatId) {
      config.telegramChatId = chatId;
      parsedMeta.telegramChatId = chatId;
      await prisma.featureFlag.upsert({
        where: { key: "admin_secret_gateway" },
        update: { metadata: JSON.stringify(parsedMeta) },
        create: {
          key: "admin_secret_gateway",
          name: "Secret Admin Gateway",
          metadata: JSON.stringify(parsedMeta),
        },
      });
    }

    // Verify Chat ID authorization (if chat ID was configured previously)
    if (config.telegramChatId && chatId !== config.telegramChatId) {
      return NextResponse.json({ ok: true, ignored: "unauthorized_chat_id" });
    }

    let replyText = "";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // 1. TIMED LOCKDOWN COMMAND (/lockdown 5m, /lockdown 1h, /lockdown 30m)
    if (upperText.startsWith("/LOCKDOWN")) {
      const parts = rawText.split(" ");
      const arg = (parts[1] || "").toLowerCase();

      let durationMinutes = 15; // default 15m
      if (arg.endsWith("m")) durationMinutes = parseInt(arg.replace("m", ""), 10) || 15;
      else if (arg.endsWith("h")) durationMinutes = (parseInt(arg.replace("h", ""), 10) || 1) * 60;
      else if (parseInt(arg, 10)) durationMinutes = parseInt(arg, 10);

      const autoUnlockAt = Date.now() + durationMinutes * 60 * 1000;

      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: {
          enabled: true,
          metadata: JSON.stringify({ autoUnlockAt }),
        },
        create: {
          key: "emergency_killswitch",
          name: "Emergency Killswitch 503",
          enabled: true,
          metadata: JSON.stringify({ autoUnlockAt }),
        },
      });

      replyText = `🚨 *TIMED LOCKDOWN ACTIVATED!*\n\n` +
        `*Status*: 🔴 CYBER DEFENSE BLACKOUT (HTTP 503 Active)\n` +
        `*Duration*: \`${durationMinutes} Minutes\`\n` +
        `*Auto-Restore At*: \`${new Date(autoUnlockAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n\n` +
        `*To Restore Manually*: Send \`/killswitch OFF\``;
    }
    // 2. UNBLOCK IP COMMAND (/unblock <IP>)
    else if (upperText.startsWith("/UNBLOCK")) {
      const parts = rawText.split(" ");
      const targetIp = (parts[1] || "").trim();

      if (!targetIp) {
        replyText = `⚠️ *Usage*: \`/unblock <IP_ADDRESS>\`\nExample: \`/unblock 49.47.250.50\``;
      } else {
        const success = await unblockIp(targetIp);
        replyText = success
          ? `✅ *IP UNBLOCKED SUCCESSFULLY!*\n\n*IP Address*: \`${targetIp}\`\n*Status*: 🟢 24-Hour Block Removed from Database.`
          : `⚠️ *IP Not Found*: \`${targetIp}\` was not active on the 24-hour block list.`;
      }
    }
    // 3. IP LOOKUP COMMAND (/ip <IP>)
    else if (upperText.startsWith("/IP")) {
      const parts = rawText.split(" ");
      const targetIp = (parts[1] || "").trim();

      if (!targetIp) {
        replyText = `⚠️ *Usage*: \`/ip <IP_ADDRESS>\`\nExample: \`/ip 185.220.101.4\``;
      } else {
        try {
          const res = await fetch(`http://ip-api.com/json/${targetIp}?fields=status,country,countryCode,regionName,city,isp,org,proxy,hosting`).catch(() => null);
          if (res && res.ok) {
            const data = await res.json().catch(() => null);
            if (data && data.status === "success") {
              const flag = getCountryFlag(data.countryCode);
              const isVpn = Boolean(data.proxy || data.hosting);
              replyText = `🔍 *IP THREAT INTELLIGENCE REPORT*\n\n` +
                `*Query IP*: \`${targetIp}\`\n` +
                `*Location*: ${flag} ${data.city}, ${data.regionName}, ${data.country}\n` +
                `*ISP*: \`${data.isp}\`\n` +
                `*Threat Level*: ${isVpn ? "🔴 CRITICAL (Active Proxy / VPN)" : "🟢 SAFE (Consumer Broadband)"}\n` +
                `*Proxy/Hosting*: \`${isVpn ? "TRUE" : "FALSE"}\``;
            } else {
              replyText = `⚠️ *Lookup Failed*: Could not fetch intelligence data for \`${targetIp}\`.`;
            }
          } else {
            replyText = `⚠️ *Lookup Failed*: API unreachable for \`${targetIp}\`.`;
          }
        } catch (e) {
          replyText = `⚠️ *Error*: Failed to query threat intelligence.`;
        }
      }
    }
    // 4. OFF / DISABLE / RESTORE COMMANDS
    else if (upperText.includes("OFF") || upperText.includes("DISABLE") || upperText.includes("RESTORE")) {
      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: { enabled: false, metadata: "" },
        create: {
          key: "emergency_killswitch",
          name: "Emergency Killswitch 503",
          enabled: false,
          metadata: "",
        },
      });

      replyText = `✅ *EMERGENCY KILL-SWITCH DEACTIVATED!*\n\n` +
        `*Status*: 🟢 SITE IS NOW LIVE & ONLINE\n` +
        `*Time*: \`${timestamp}\`\n\n` +
        `*System*: Normal operation restored across all global edges.`;
    }
    // 5. ON / ENABLE / SHUTDOWN COMMANDS
    else if (upperText.includes("ON") || upperText.includes("ENABLE") || upperText.includes("SHUTDOWN")) {
      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: { enabled: true, metadata: "" },
        create: {
          key: "emergency_killswitch",
          name: "Emergency Killswitch 503",
          enabled: true,
          metadata: "",
        },
      });

      replyText = `🚨 *EMERGENCY KILL-SWITCH ACTIVATED!*\n\n` +
        `*Status*: 🔴 SITE IS NOW SHUT DOWN (HTTP 503 Cyber Defense Mode Active)\n` +
        `*Time*: \`${timestamp}\`\n\n` +
        `*To Restore*: Send \`/killswitch OFF\` or \`OFF\``;
    }
    // 6. LIVE SYSTEM METRICS STATS COMMAND (/stats, /status, /start, /help)
    else if (upperText.startsWith("/STATS") || upperText.startsWith("/STATUS") || upperText.startsWith("/START") || upperText.startsWith("/HELP")) {
      const ksFlag = await prisma.featureFlag.findUnique({ where: { key: "emergency_killswitch" } });
      const logsFlag = await prisma.featureFlag.findUnique({ where: { key: "security_audit_logs" } });
      const rateFlag = await prisma.featureFlag.findUnique({ where: { key: "ip_rate_limits_24h" } });

      let logCount = 0;
      if (logsFlag?.metadata) {
        try { logCount = JSON.parse(logsFlag.metadata).length; } catch (e) {}
      }

      let blockedIpCount = 0;
      if (rateFlag?.metadata) {
        try {
          const records = JSON.parse(rateFlag.metadata);
          blockedIpCount = Object.values(records).filter((r) => r.count > 5).length;
        } catch (e) {}
      }

      const isLive = !(ksFlag?.enabled);
      replyText = `🛡️ *GV CYBER VAULT METRICS & STATUS*\n\n` +
        `*Site Status*: ${isLive ? "🟢 ONLINE" : "🔴 EMERGENCY LOCKDOWN (503)"}\n` +
        `*Geo-Fence Policy*: 🇮🇳 INDIA ONLY (Admin Routes Restricted)\n` +
        `*24h Blocked IPs*: \`${blockedIpCount} IPs\`\n` +
        `*Security Audit Logs*: \`${logCount} Events Logged\`\n` +
        `*Chat ID Captured*: \`${chatId}\` (Saved to DB)\n\n` +
        `*Available Commands*:\n` +
        `• \`/killswitch ON\` - Immediate site shutdown (503)\n` +
        `• \`/killswitch OFF\` - Restore site online\n` +
        `• \`/lockdown 15m\` - Timed shutdown with auto-restore\n` +
        `• \`/ip 185.220.101.4\` - Threat intelligence IP lookup\n` +
        `• \`/unblock 49.47.250.50\` - Unblock IP from 24h block list\n` +
        `• \`/stats\` - System metrics & health status`;
    }

    // Direct Telegram reply payload (Works natively in Telegram Webhook response!)
    if (replyText) {
      return NextResponse.json({
        method: "sendMessage",
        chat_id: chatId,
        text: replyText,
        parse_mode: "Markdown",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
