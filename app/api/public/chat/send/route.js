import { NextResponse } from "next/server";
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
    return { location: "Local Server / India", isp: "Internal Network", flag: "🏠" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

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
          flag,
        };
      }
    }
  } catch (e) {}

  return { location: "Unknown Location", isp: "Unknown Carrier", flag: "🌐" };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionToken, visitorName, visitorEmail, text, currentMode } = body;

    if (!sessionToken || !text || !text.trim()) {
      return NextResponse.json({ ok: false, error: "Message text is required" }, { status: 400 });
    }

    const cleanText = text.trim().slice(0, 2000);
    const cleanName = (visitorName || "Anonymous Visitor").trim().slice(0, 80);
    const cleanEmail = (visitorEmail || "").trim().slice(0, 120);
    const cleanMode = (currentMode || "Landing").trim().slice(0, 50);

    // Extract visitor IP from edge headers
    const forwarded = req.headers.get("x-forwarded-for");
    const cfIp = req.headers.get("cf-connecting-ip");
    const realIp = req.headers.get("x-real-ip");
    let ip = cfIp || realIp || (forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1");

    const geo = await getIpGeo(ip);

    // 1. Upsert or update ChatSession in DB
    const session = await prisma.chatSession.upsert({
      where: { sessionToken },
      update: {
        visitorName: cleanName,
        visitorEmail: cleanEmail || undefined,
        visitorIp: ip,
        visitorLocation: geo.location,
        visitorCarrier: geo.isp,
        currentMode: cleanMode,
        lastActiveAt: new Date(),
        unreadByAdmin: { increment: 1 },
      },
      create: {
        sessionToken,
        visitorName: cleanName,
        visitorEmail: cleanEmail,
        visitorIp: ip,
        visitorLocation: geo.location,
        visitorCarrier: geo.isp,
        currentMode: cleanMode,
        unreadByAdmin: 1,
      },
    });

    // 2. Fetch Telegram Bot Config from DB
    const gatewayFlag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let config = {
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
      telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
    };

    if (gatewayFlag?.metadata) {
      try {
        const parsed = typeof gatewayFlag.metadata === "string" ? JSON.parse(gatewayFlag.metadata) : gatewayFlag.metadata;
        if (parsed.telegramBotToken) config.telegramBotToken = String(parsed.telegramBotToken).trim();
        if (parsed.telegramChatId) config.telegramChatId = String(parsed.telegramChatId).trim();
      } catch (e) {}
    }

    let telegramMsgId = null;
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // 3. Dispatch Live Telegram Push Notification
    if (config.telegramBotToken && config.telegramChatId) {
      const emailLine = cleanEmail ? `📧 <b>Email</b>: <code>${cleanEmail}</code>\n` : "";
      const telegramText =
        `💬 <b>NEW LIVE CHAT MESSAGE</b>\n\n` +
        `👤 <b>Visitor</b>: <b>${cleanName}</b>\n` +
        emailLine +
        `🌐 <b>Location</b>: ${geo.location}\n` +
        `📍 <b>Mode</b>: <code>${cleanMode}</code>\n` +
        `🕒 <b>Time (IST)</b>: <code>${timestamp}</code>\n\n` +
        `📝 <b>Message</b>:\n` +
        `<i>"${cleanText}"</i>\n\n` +
        `⚡ <b>Quick Reply Options</b>:\n` +
        `• Type: <code>/r ${cleanText.slice(0, 15)}...</code> &lt;your reply&gt;\n` +
        `• Or simply <b>Swipe-Reply</b> to this message!`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: config.telegramChatId,
            text: telegramText,
            parse_mode: "HTML",
          }),
        });

        if (tgRes.ok) {
          const tgData = await tgRes.json().catch(() => null);
          if (tgData?.result?.message_id) {
            telegramMsgId = tgData.result.message_id;
          }
        }
      } catch (tgErr) {
        console.error("Telegram notification error:", tgErr);
      }
    }

    // 4. Save ChatMessage to DB
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "VISITOR",
        senderName: cleanName,
        text: cleanText,
        telegramMsgId: telegramMsgId,
        read: false,
      },
    });

    return NextResponse.json({
      ok: true,
      messageId: message.id,
      sessionId: session.id,
      createdAt: message.createdAt,
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 });
  }
}
