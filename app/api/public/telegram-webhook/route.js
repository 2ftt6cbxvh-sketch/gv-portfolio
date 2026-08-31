import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unblockIp } from "@/lib/rateLimit";
import { getDetailedTelemetry } from "@/lib/telemetry";

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
    // 💬 FEATURE 1: 2-Way Live Chat Reply Handler (/r, /c, or Direct Swipe-Reply)
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
    // 🛠️ FEATURE 2: Under Maintenance Mode Control (/maintenance)
    // ──────────────────────────────────────────────────────────────────────────
    else if (upperText.startsWith("/MAINTENANCE") || upperText.startsWith("/MAINT")) {
      const parts = rawText.split(" ");
      const action = (parts[1] || "").toUpperCase();
      const customParam = parts.slice(2).join(" ").trim();

      if (action === "OFF" || action === "DISABLE" || action === "STOP") {
        await prisma.featureFlag.upsert({
          where: { key: "under_maintenance_mode" },
          update: { enabled: false, metadata: "" },
          create: { key: "under_maintenance_mode", name: "Under Maintenance Mode", enabled: false, metadata: "" },
        });

        replyText =
          `✅ *MAINTENANCE MODE DEACTIVATED!*\n\n` +
          `*Status*: 🟢 SITE IS FULLY LIVE & PUBLIC\n` +
          `*Time*: \`${timestamp}\`\n\n` +
          `*System*: Normal operation restored across all global edges.`;
      } else if (action === "STATUS") {
        const flag = await prisma.featureFlag.findUnique({ where: { key: "under_maintenance_mode" } });
        let meta = {};
        if (flag?.metadata) {
          try { meta = JSON.parse(flag.metadata); } catch (e) {}
        }
        const isActive = !!flag?.enabled;

        replyText =
          `🛠️ *MAINTENANCE MODE STATUS*\n\n` +
          `*Status*: ${isActive ? "🟡 ACTIVE (Maintenance Screen Shown)" : "🟢 OFF (Site is Live)"}\n` +
          `*Custom Notice*: ${meta.message || "Default Notice"}\n` +
          `*ETA*: ${meta.eta || "N/A"}\n\n` +
          `*To toggle*: \`/maintenance ON [message]\` or \`/maintenance OFF\``;
      } else {
        // ON or Timed Maintenance (e.g. /maintenance ON or /maintenance 45m or /maintenance ON System Upgrade)
        let durationMinutes = 0;
        let noticeMessage = customParam || "We are currently performing high-speed infrastructure optimizations and upgrading the AI & 3D graphics engine.";
        let eta = "30 - 45 Minutes";

        if (action.endsWith("M")) {
          durationMinutes = parseInt(action.replace("M", ""), 10) || 30;
          eta = `${durationMinutes} Minutes`;
        } else if (action.endsWith("H")) {
          durationMinutes = (parseInt(action.replace("H", ""), 10) || 1) * 60;
          eta = `${durationMinutes / 60} Hour(s)`;
        }

        const autoRestoreAt = durationMinutes > 0 ? Date.now() + durationMinutes * 60 * 1000 : null;
        const metaPayload = {
          message: noticeMessage,
          eta: eta,
          autoRestoreAt: autoRestoreAt,
        };

        await prisma.featureFlag.upsert({
          where: { key: "under_maintenance_mode" },
          update: { enabled: true, metadata: JSON.stringify(metaPayload) },
          create: { key: "under_maintenance_mode", name: "Under Maintenance Mode", enabled: true, metadata: JSON.stringify(metaPayload) },
        });

        const restoreNotice = autoRestoreAt
          ? `\n*Auto-Restore At*: \`${new Date(autoRestoreAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\``
          : "";

        replyText =
          `🛠️ *UNDER MAINTENANCE MODE ACTIVATED!*\n\n` +
          `*Status*: 🟡 ACTIVE (Cyber Maintenance Screen Active)\n` +
          `*Notice*: "${noticeMessage}"\n` +
          `*ETA*: \`${eta}\`${restoreNotice}\n` +
          `*Admin Bypass*: \`/admin\` remains unlocked for you.\n\n` +
          `*To Deactivate*: Send \`/maintenance OFF\``;
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 🤖 SECURITY COMMAND REGISTRY
    // ──────────────────────────────────────────────────────────────────────────
    // 1. ALL COMMANDS LIST (/commands, /help)
    else if (upperText.startsWith("/COMMANDS") || upperText.startsWith("/HELP") || upperText === "/START") {
      replyText = `🤖 *GV CYBER VAULT TELEGRAM COMMAND REGISTRY*\n\n` +
        `*Live Visitor Chat*:\n` +
        `• \`/r <message>\` — Reply to the latest live chat visitor\n` +
        `• *Swipe-Reply* — Swipe any visitor alert to reply directly\n\n` +
        `*Maintenance & Defense*:\n` +
        `• \`/maintenance ON [message]\` — Turn ON maintenance mode\n` +
        `• \`/maintenance 30m\` — Timed maintenance (Auto-restores)\n` +
        `• \`/maintenance OFF\` — Turn OFF maintenance mode\n` +
        `• \`/killswitch ON\` — Emergency 503 defense blackout\n` +
        `• \`/killswitch OFF\` — Restore site online\n` +
        `• \`/lockdown 15m\` — Timed 503 shutdown\n\n` +
        `*Intelligence & Telemetry*:\n` +
        `• \`/ip <IP>\` — Precise GPS coordinates & Google Maps pin\n` +
        `• \`/blacklist <IP>\` — Block IP for 24 hours\n` +
        `• \`/unblock <IP>\` — Whitelist / Unblock IP\n` +
        `• \`/logs\` — View last 5 security events\n` +
        `• \`/stats\` — System metrics & database health`;
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
          const dev = l.device || "Unknown Device";
          const map = l.googleMapsUrl ? `\n   • 📍 [Google Maps Pin](${l.googleMapsUrl})` : "";
          return `${i + 1}. *${l.type}*\n   • IP: \`${l.ip || "127.0.0.1"}\` (${l.location || "Local"})\n   • Device: \`${dev}\`${map}\n   • Time: \`${timeStr}\``;
        }).join("\n\n");

        replyText = `📋 *LAST 5 SECURITY AUDIT LOGS*\n\n${logLines}`;
      }
    }
    // 3. IP LOOKUP COMMAND WITH PRECISION GPS PIN (/ip <IP>)
    else if (upperText.startsWith("/IP")) {
      const parts = rawText.split(" ");
      const targetIp = (parts[1] || "").trim();

      if (!targetIp) {
        replyText = `⚠️ *Usage*: \`/ip <IP_ADDRESS>\`\nExample: \`/ip 185.220.101.4\``;
      } else {
        const telemetry = await getDetailedTelemetry(targetIp);
        const mapsLink = telemetry.googleMapsUrl
          ? `\n*📍 GPS Coordinates*: [${telemetry.coordinates}](${telemetry.googleMapsUrl})`
          : "";

        replyText =
          `🔍 *IP THREAT & PRECISION GPS INTELLIGENCE*\n\n` +
          `*Query IP*: \`${targetIp}\`\n` +
          `*Location*: ${telemetry.location}${mapsLink}\n` +
          `*ISP / Carrier*: \`${telemetry.isp}\`\n` +
          `*Autonomous System*: \`${telemetry.asOrg}\`\n` +
          `*Location Integrity*: *${telemetry.integrityStatus}*\n` +
          `*Proxy / VPN Detected*: \`${telemetry.isProxy ? "TRUE" : "FALSE"}\``;
      }
    }
    // 4. BLACKLIST IP COMMAND (/blacklist <IP>)
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
    // 5. UNBLOCK / WHITELIST COMMAND (/unblock <IP>, /whitelist <IP>)
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
    // 6. TIMED LOCKDOWN COMMAND (/lockdown 5m, /lockdown 1h)
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
    // 7. OFF / DISABLE / RESTORE COMMANDS (Killswitch)
    else if (upperText === "/KILLSWITCH OFF" || upperText === "OFF") {
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
    // 8. ON / ENABLE / SHUTDOWN COMMANDS (Killswitch)
    else if (upperText === "/KILLSWITCH ON" || upperText === "ON") {
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
      const maintFlag = await prisma.featureFlag.findUnique({ where: { key: "under_maintenance_mode" } });
      const logsFlag = await prisma.featureFlag.findUnique({ where: { key: "security_audit_logs" } });
      const rateFlag = await prisma.featureFlag.findUnique({ where: { key: "ip_rate_limits_24h" } });
      const chatSessionsCount = await prisma.chatSession.count();

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

      const isLive = !(ksFlag?.enabled) && !(maintFlag?.enabled);
      const siteStatus = ksFlag?.enabled ? "🔴 EMERGENCY LOCKDOWN (503)" : maintFlag?.enabled ? "🟡 UNDER MAINTENANCE" : "🟢 ONLINE";

      replyText = `🛡️ *GV CYBER VAULT METRICS & STATUS*\n\n` +
        `*Site Status*: ${siteStatus}\n` +
        `*Live Chat Active Sessions*: \`${chatSessionsCount} Sessions\`\n` +
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
