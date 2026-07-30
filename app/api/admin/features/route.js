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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { key, enabled, metadata } = await request.json();
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

    const updated = await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled, ...(metadata !== undefined ? { metadata } : {}) },
      create: { key, name: key, enabled, metadata: metadata || "" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 });
  }
}
