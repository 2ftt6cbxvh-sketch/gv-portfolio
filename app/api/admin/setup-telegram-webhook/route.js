import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let botToken = "";
    if (flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.telegramBotToken) botToken = String(parsed.telegramBotToken).trim();
      } catch (e) {}
    }

    if (!botToken) {
      return NextResponse.json({ success: false, error: "Telegram Bot Token is missing. Save your Bot Token first." }, { status: 400 });
    }

    const webhookUrl = "https://www.ganeshvarma.in/api/public/telegram-webhook";
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

    const res = await fetch(telegramApiUrl);
    const data = await res.json();

    if (data.ok) {
      return NextResponse.json({ success: true, message: `Telegram Webhook bound to ${webhookUrl}`, description: data.description });
    } else {
      return NextResponse.json({ success: false, error: data.description || "Telegram API registration failed" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
