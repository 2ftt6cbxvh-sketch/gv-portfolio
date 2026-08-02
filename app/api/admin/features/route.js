import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
    return NextResponse.json(flags);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const body = await request.json();
    const { key, enabled, metadata } = body;
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

    const updated = await prisma.featureFlag.upsert({
      where: { key },
      update: {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(metadata !== undefined ? { metadata: typeof metadata === "object" ? JSON.stringify(metadata) : String(metadata) } : {}),
      },
      create: {
        key,
        name: key.replace(/_/g, " ").toUpperCase(),
        enabled: enabled !== undefined ? enabled : true,
        metadata: metadata ? (typeof metadata === "object" ? JSON.stringify(metadata) : String(metadata)) : "",
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feature flag: " + error.message }, { status: 500 });
  }
}
