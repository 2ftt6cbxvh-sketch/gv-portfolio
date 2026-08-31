import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDetailedTelemetry } from "@/lib/telemetry";

// Format and validate Indian Phone Number (+91 format, 10 digits starting with 6-9)
function validateIndianPhoneNumber(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  let standardDigits = digits;

  if (digits.length === 12 && digits.startsWith("91")) {
    standardDigits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    standardDigits = digits.slice(1);
  }

  if (/^[6-9]\d{9}$/.test(standardDigits)) {
    return standardDigits;
  }
  return null;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionToken, visitorName, visitorPhone, visitorEmail, text, currentMode } = body;

    if (!sessionToken || !text || !text.trim()) {
      return NextResponse.json({ ok: false, error: "Message text is required" }, { status: 400 });
    }

    const cleanName = (visitorName || "").trim().slice(0, 80);
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ ok: false, error: "Please enter your name (minimum 2 characters)." }, { status: 400 });
    }

    const validatedPhone = validateIndianPhoneNumber(visitorPhone);
    if (!validatedPhone) {
      return NextResponse.json({
        ok: false,
        error: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).",
      }, { status: 400 });
    }

    const cleanText = text.trim().slice(0, 2000);
    const cleanEmail = (visitorEmail || "").trim().slice(0, 120);
    const cleanMode = (currentMode || "Landing").trim().slice(0, 50);

    // Auto-prune old sessions older than 24 hours to save DB space and prevent clutter
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.chatSession.deleteMany({
      where: { lastActiveAt: { lt: twentyFourHoursAgo } },
    }).catch(() => {});

    // Extract visitor IP and User-Agent from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const cfIp = req.headers.get("cf-connecting-ip");
    const realIp = req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    let ip = cfIp || realIp || (forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1");

    const telemetry = await getDetailedTelemetry(ip, userAgent);

    // 1. Upsert or update ChatSession in DB
    const session = await prisma.chatSession.upsert({
      where: { sessionToken },
      update: {
        visitorName: cleanName,
        visitorPhone: `+91 ${validatedPhone}`,
        visitorEmail: cleanEmail || undefined,
        visitorIp: ip,
        visitorLocation: telemetry.location,
        visitorCarrier: telemetry.isp,
        currentMode: cleanMode,
        lastActiveAt: new Date(),
        unreadByAdmin: { increment: 1 },
      },
      create: {
        sessionToken,
        visitorName: cleanName,
        visitorPhone: `+91 ${validatedPhone}`,
        visitorEmail: cleanEmail,
        visitorIp: ip,
        visitorLocation: telemetry.location,
        visitorCarrier: telemetry.isp,
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

    // 3. Dispatch Live Telegram Push Notification with direct Phone & WhatsApp action links & GPS Pin
    if (config.telegramBotToken && config.telegramChatId) {
      const emailLine = cleanEmail ? `📧 <b>Email</b>: <code>${cleanEmail}</code>\n` : "";
      const mapsLink = telemetry.googleMapsUrl
        ? `\n📍 <b>GPS Pin</b>: <a href="${telemetry.googleMapsUrl}">View on Google Maps</a> (<code>${telemetry.coordinates}</code>)`
        : "";

      const telegramText =
        `💬 <b>NEW LIVE CHAT MESSAGE</b>\n\n` +
        `👤 <b>Visitor</b>: <b>${cleanName}</b>\n` +
        `📱 <b>Phone</b>: <code>+91 ${validatedPhone}</code> (<a href="tel:+91${validatedPhone}">Call</a> | <a href="https://wa.me/91${validatedPhone}">WhatsApp</a>)\n` +
        emailLine +
        `🌐 <b>Location</b>: ${telemetry.location}${mapsLink}\n` +
        `📶 <b>ISP / Carrier</b>: <code>${telemetry.isp}</code>\n` +
        `🛰️ <b>Integrity</b>: <b>${telemetry.integrityStatus}</b>\n` +
        `📱 <b>Hardware Device</b>: <code>${telemetry.device.summary}</code>\n` +
        `📍 <b>Mode</b>: <code>${cleanMode}</code>\n` +
        `🕒 <b>Time (IST)</b>: <code>${timestamp}</code>\n\n` +
        `📝 <b>Message</b>:\n` +
        `<i>"${cleanText}"</i>\n\n` +
        `⚡ <b>Quick Reply Options</b>:\n` +
        `• Type: <code>/r &lt;your reply&gt;</code>\n` +
        `• Or simply <b>Swipe-Reply</b> to this alert!`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: config.telegramChatId,
            text: telegramText,
            parse_mode: "HTML",
            disable_web_page_preview: false,
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
