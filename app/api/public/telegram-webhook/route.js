import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body.message || body.channel_post;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat?.id || "");
    const rawText = (message.text || "").trim().toUpperCase();

    // Fetch Telegram Config from DB
    const gatewayFlag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let config = { telegramChatId: "", telegramBotToken: "" };
    if (gatewayFlag?.metadata) {
      try {
        const parsed = typeof gatewayFlag.metadata === "string" ? JSON.parse(gatewayFlag.metadata) : gatewayFlag.metadata;
        if (parsed.telegramChatId) config.telegramChatId = String(parsed.telegramChatId).trim();
        if (parsed.telegramBotToken) config.telegramBotToken = String(parsed.telegramBotToken).trim();
      } catch (e) {}
    }

    // Verify Chat ID authorization
    if (config.telegramChatId && chatId !== config.telegramChatId) {
      return NextResponse.json({ ok: true, ignored: "unauthorized_chat_id" });
    }

    let replyText = "";

    // Check OFF / DEACTIVATE / RESTORE commands first (prevents quote reply collision!)
    if (rawText.includes("OFF") || rawText.includes("DISABLE") || rawText.includes("RESTORE")) {
      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: { enabled: false },
        create: {
          key: "emergency_killswitch",
          name: "Emergency Killswitch 503",
          enabled: false,
        },
      });

      replyText = `✅ *EMERGENCY KILL-SWITCH DEACTIVATED!*\n\n` +
        `*Status*: 🟢 SITE IS NOW LIVE & ONLINE\n` +
        `*Time*: \`${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n\n` +
        `*System*: Normal operation restored across all global edges.`;
    } else if (rawText.includes("ON") || rawText.includes("ENABLE") || rawText.includes("SHUTDOWN")) {
      await prisma.featureFlag.upsert({
        where: { key: "emergency_killswitch" },
        update: { enabled: true },
        create: {
          key: "emergency_killswitch",
          name: "Emergency Killswitch 503",
          enabled: true,
        },
      });

      replyText = `🚨 *EMERGENCY KILL-SWITCH ACTIVATED!*\n\n` +
        `*Status*: 🔴 SITE IS NOW SHUT DOWN (HTTP 503 Cyber Defense Mode Active)\n` +
        `*Time*: \`${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\`\n\n` +
        `*To Restore*: Send \`/killswitch OFF\` or \`OFF\``;
    } else if (rawText.startsWith("/STATUS") || rawText.startsWith("/START") || rawText.startsWith("/HELP")) {
      const ksFlag = await prisma.featureFlag.findUnique({
        where: { key: "emergency_killswitch" },
      });

      const isLive = !(ksFlag?.enabled);
      replyText = `🛡️ *GV CYBER VAULT SECURITY BOT*\n\n` +
        `*Site Status*: ${isLive ? "🟢 ONLINE" : "🔴 EMERGENCY LOCKDOWN (503)"}\n\n` +
        `*Commands*:\n` +
        `• \`/killswitch ON\` - Instantly shutdown site (503)\n` +
        `• \`/killswitch OFF\` - Restore site online\n` +
        `• \`/status\` - Check current system status`;
    }

    if (replyText && config.telegramBotToken) {
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: "Markdown",
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
