import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flag = await prisma.featureFlag.findUnique({
      where: { key: "security_audit_logs" },
    });

    let logs = [];
    if (flag?.metadata) {
      try {
        logs = JSON.parse(flag.metadata);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
