import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionToken = searchParams.get("sessionToken");

    if (!sessionToken) {
      return NextResponse.json({ ok: false, error: "Missing sessionToken" }, { status: 400 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { sessionToken },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ ok: true, messages: [], session: null });
    }

    // Reset unread count for visitor
    if (session.unreadByVisitor > 0) {
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { unreadByVisitor: 0 },
      });
    }

    return NextResponse.json({
      ok: true,
      session: {
        id: session.id,
        visitorName: session.visitorName,
        status: session.status,
      },
      messages: session.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        senderName: m.senderName,
        text: m.text,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error syncing chat messages:", error);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
