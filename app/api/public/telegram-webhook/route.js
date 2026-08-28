import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unblockIp, check24HourRateLimit } from "@/lib/rateLimit";

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
    const replyToMsg = message.reply_to_message;

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

    // Verify Chat ID authorization
    if (config.telegramChatId && chatId !== config.telegramChatId) {
      return NextResponse.json({ ok: true, ignored: "unauthorized_chat_id" });
    }

    let replyText = "";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // ──────────────────────────────────────────────────────────────────────────
    // 💬 FEATURE: 2-Way Live Chat Reply Handler (/r, /c, or Direct Swipe-Reply)
    // ──────────────────────────────────────────────────────────────────────────
    const isExplicitReplyCommand = upperText.startsWith("/R ") || upperText.startsWith("/C ") || upperText.startsWith("/REPLY ");
    const isSwipeReply = Boolean(replyToMsg && !rawText.startsWith("/"));

    if (isExplicitReplyCommand || isSwipeReply) {
      let messageContent = rawText;
      if (isExplicitReplyCommand) {
        const parts = rawText.split(" ");
        messageContent = parts.slice(1).join(" ").trim();
      }

      if (!messageContent) {
        replyText = `⚠️ *Usage*: \`/r <your message>\`\nExample: \`/r Yes, I am open for freelance projects!\``;
      } else {
        let targetSession = null;

        // 1. If replying to a specific Telegram alert, correlate by telegramMsgId
        if (replyToMsg?.message_id) {
          const matchedMessage = await prisma.chatMessage.findFirst({
            where: { telegramMsgId: replyToMsg.message_id },
            include: { session: true },
          });
          if (matchedMessage?.session) {
            targetSession = matchedMessage.session;
          }
        }

        // 2. Fallback to the latest active chat session
        if (!targetSession) {
          targetSession = await prisma.chatSession.findFirst({
            where: { status: "ACTIVE" },
            orderBy: { lastActiveAt: "desc" },
          });
        }

        if (!targetSession) {
          replyText = `⚠️ *No Active Visitor Session Found*\n\nThere are currently no active live chat conversations in the database.`;
        } else {
          // Insert Admin Chat Message
          await prisma.chatMessage.create({
            data: {
              sessionId: targetSession.id,
              sender: "ADMIN",
              senderName: "Ganesh Varma",
              text: messageContent,
              read: true,
            },
          });

          // Update Session Activity & increment unread for visitor
          await prisma.chatSession.update({
            where: { id: targetSession.id },
            data: {
              lastActiveAt: new Date(),
              unreadByVisitor: { increment: 1 },
            },
          });

          replyText =
            `✅ *REPLY DELIVERED TO VISITOR*\n\n` +
            `👤 *Recipient*: *${targetSession.visitorName}*\n` +
            `📍 *Mode*: \`${targetSession.currentMode || "Landing"}\`\n` +
            `💬 *Your Reply*: "${messageContent}"\n\n` +
            `⚡ *Visitor screen updated in real-time!*`;
        }
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 🤖 SECURITY COMMAND REGISTRY
    // ──────────────────────────────────────────────────────────────────────────
    // 1. ALL COMMANDS LIST (/commands, /help)
    else if (upperText.startsWith("/COMMANDS") || upperText.startsWith("/HELP") || upperText === "/START") {
      replyText = `🤖 *GV CYBER VAULT TELEGRAM COMMAND REGISTRY*\n\n` +
        `*Live Chat Commands*:\n` +
        `• \`/r <message>\` — Reply to the latest live chat visitor\n` +
        `• *Swipe-Reply* — Swipe any visitor alert to chat directly\n\n` +
        `*Security Controls*:\n` +
        `• \`/killswitch ON\` — Instantly shut down site (HTTP 503)\n` +
        `• \`/killswitch OFF\` — Restore site online\n` +
        `• \`/lockdown 15m\` — Timed shutdown (Auto-restores in X mins)\n` +
        `• \`/blacklist <IP>\` — Manually block an IP address\n` +
        `• \`/unblock <IP>\` — Remove IP from 24h block list\n` +
        `• \`/whitelist <IP>\` — Same as unblock IP\n\n` +
        `*Intelligence & Telemetry*:\n` +
        `• \`/ip <IP>\` — Threat intelligence & location lookup\n` +
        `• \`/logs\` — View last 5 security audit events\n` +
        `• \`/stats\` — System metrics & database health\n` +
        `• \`/commands\` — Display this command menu`;
    }
    // 2. LOGS COMMAND (/logs)
    else if (upperText.startsWith("/LOGS")) {
      const logsFlag = await prisma.featureFlag.findUnique({ where: { key: "security_audit_logs" } });
      let logs = [];
      if (logsFlag?.metadata) {
        try { logs = JSON.parse(logsFlag.metadata).slice(0, 5); } catch (e) {}
      }

      if (logs.length === 0) {
        replyText = `📋 *SECURITY AUDIT LOGS*\n\nNo recent security events logged.`;
      } else {
        const logLines = logs.map((l, i) => {
          const timeStr = l.timestamp ? new Date(l.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A";
          return `${i + 1}. *${l.type}*\n   • IP: \`${l.ip || "127.0.0.1"}\` (${l.location || "Local"})\n   • Time: \`${timeStr}\``;
        }).join("\n\n");

        replyText = `📋 *LAST 5 SECURITY AUDIT LOGS*\n\n${logLines}`;
      }
    }
    // 3. BLACKLIST IP COMMAND (/blacklist <IP>)
    else if (upperText.startsWith("/BLACKLIST")) {
      const parts = rawText.split(" ");
      const targetIp = (parts[1] || "").trim();

      if (!targetIp) {
        replyText = `⚠️ *Usage*: \`/blacklist <IP_ADDRESS>\`\nExample: \`/blacklist 185.220.101.4\``;
      } else {
        const windowMs = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const flag = await prisma.featureFlag.findUnique({ where: { key: "ip_rate_limits_24h" } });
        let records = {};
        if (flag?.metadata) {
          try { records = JSON.parse(flag.metadata); } catch (e) {}
        }
        records[targetIp] = { count: 999, resetAt: now + windowMs };

        await prisma.featureFlag.upsert({
          where: { key: "ip_rate_limits_24h" },
          update: { metadata: JSON.stringify(records) },
          create: { key: "ip_rate_limits_24h", name: "24h IP Rate Limits", enabled: true, metadata: JSON.stringify(records) },
        });

        replyText = `🚫 *IP MANUALLY BLACKLISTED!*\n\n*Target IP*: \`${targetIp}\`\n*Status*: 🔴 Blocked in PostgreSQL database for 24 hours.`;
      }
    }
    // 4. UNBLOCK / WHITELIST COMMAND (/unblock <IP>, /whitelist <IP>)
    else if (upperText.startsWith("/UNBLOCK") || upperText.startsWith("/WHITELIST")) {
      const parts = rawText.split(" ");
      const targetIp = (parts[1] || "").trim();

      if (!targetIp) {
        replyText = `⚠️ *Usage*: \`/unblock <IP_ADDRESS>\`\nExample: \`/unblock 49.47.250.50\``;
      } else {
        const success = await unblockIp(targetIp);
        replyText = success
          ? `✅ *IP UNBLOCKED & WHITELISTED!*\n\n*IP Address*: \`${targetIp}\`\n*Status*: 🟢 24-Hour Block Removed from Database.`
          : `⚠️ *IP Not Found*: \`${targetIp}\` was not active on the 24-hour block list.`;
      }
    }
    // 5. TIMED LOCKDOWN COMMAND (/lockdown 5m, /lockdown 1h)
    else if (upperText.startsWith("/LOCKDOWN")) {
      const parts = rawText.split(" ");
      const arg = (parts[1] || "").toLowerCase();

      let durationMinutes = 15;
      if (arg.endsWith("m")) durationMinutes = parseInt(arg.replace("m", ""), 10) || 15;
      else if (arg.endsWith("h")) durationMinutes = (parseInt(arg.replace("h", ""), 10) || 1) * 60;
      else if (parseInt(arg, 10)) durationMinutes = parseInt(arg, 10);

      const autoUnlockAt = Date.now() + durationMinutes * 60 * 1000;

      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: { enabled: true, metadata: JSON.stringify({ autoUnlockAt }) },
        create: { key: "emergency_killswitch", name: "Emergency Killswitch 503", enabled: true, metadata: JSON.stringify({ autoUnlockAt }) },
      });

      replyText = `🚨 *TIMED LOCKDOWN ACTIVATED!*\n\n` +
        `*Status*: 🔴 CYBER DEFENSE BLACKOUT (HTTP 503 Active)\n` +
        `*Duration*: \`${durationMinutes} Minutes\`\n` +
        `*Auto-Restore At*: \`${new Date(autoUnlockAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n\n` +
        `*To Restore Manually*: Send \`/killswitch OFF\``;
    }
    // 6. IP LOOKUP COMMAND (/ip <IP>)
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
              replyText = `⚠️ *Lookup Failed*: Could not fetch data for \`${targetIp}\`.`;
            }
          } else {
            replyText = `⚠️ *Lookup Failed*: API unreachable for \`${targetIp}\`.`;
          }
        } catch (e) {
          replyText = `⚠️ *Error*: Failed to query threat intelligence.`;
        }
      }
    }
    // 7. OFF / DISABLE / RESTORE COMMANDS
    else if (upperText.includes("OFF") || upperText.includes("DISABLE") || upperText.includes("RESTORE")) {
      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: { enabled: false, metadata: "" },
        create: { key: "emergency_killswitch", name: "Emergency Killswitch 503", enabled: false, metadata: "" },
      });

      replyText = `✅ *EMERGENCY KILL-SWITCH DEACTIVATED!*\n\n` +
        `*Status*: 🟢 SITE IS NOW LIVE & ONLINE\n` +
        `*Time*: \`${timestamp}\`\n\n` +
        `*System*: Normal operation restored across all global edges.`;
    }
    // 8. ON / ENABLE / SHUTDOWN COMMANDS
    else if (upperText.includes("ON") || upperText.includes("ENABLE") || upperText.includes("SHUTDOWN")) {
      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: { enabled: true, metadata: "" },
        create: { key: "emergency_killswitch", name: "Emergency Killswitch 503", enabled: true, metadata: "" },
      });

      replyText = `🚨 *EMERGENCY KILL-SWITCH ACTIVATED!*\n\n` +
        `*Status*: 🔴 SITE IS NOW SHUT DOWN (HTTP 503 Cyber Defense Mode Active)\n` +
        `*Time*: \`${timestamp}\`\n\n` +
        `*To Restore*: Send \`/killswitch OFF\``;
    }
    // 9. METRICS & STATS COMMAND (/stats, /status)
    else if (upperText.startsWith("/STATS") || upperText.startsWith("/STATUS")) {
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
        `*To view all available commands*: Send \`/commands\``;
    }

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
