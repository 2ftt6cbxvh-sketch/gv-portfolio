import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { sessionId, text } = body;

    if (!sessionId || !text || !text.trim()) {
      return NextResponse.json({ ok: false, error: "Missing sessionId or text" }, { status: 400 });
    }

    const cleanText = text.trim().slice(0, 2000);

    const targetSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!targetSession) {
      return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
    }

    // Insert Admin Message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: targetSession.id,
        sender: "ADMIN",
        senderName: "Ganesh Varma",
        text: cleanText,
        read: true,
      },
    });

    // Update Session
    await prisma.chatSession.update({
      where: { id: targetSession.id },
      data: {
        lastActiveAt: new Date(),
        unreadByVisitor: { increment: 1 },
      },
    });

    return NextResponse.json({
      ok: true,
      messageId: message.id,
      createdAt: message.createdAt,
    });
  } catch (error) {
    console.error("Admin chat reply error:", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
