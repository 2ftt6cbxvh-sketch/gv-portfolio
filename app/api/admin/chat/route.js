import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Fetch specific session with full message history
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!session) {
        return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
      }

      // Mark unreadByAdmin as 0
      if (session.unreadByAdmin > 0) {
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { unreadByAdmin: 0 },
        });
      }

      return NextResponse.json({ ok: true, session });
    }

    // List all sessions ordered by most recently active
    const sessions = await prisma.chatSession.findMany({
      orderBy: { lastActiveAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // latest message preview
        },
      },
    });

    return NextResponse.json({ ok: true, sessions });
  } catch (error) {
    console.error("Admin chat fetch error:", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
