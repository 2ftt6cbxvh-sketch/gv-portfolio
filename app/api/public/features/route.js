import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [flags, milestones] = await Promise.all([
      prisma.featureFlag.findMany(),
      prisma.journeyMilestone.findMany({
        where: { visible: true },
        orderBy: { order: "asc" },
      }),
    ]);

    const flagsMap = {};
    flags.forEach((f) => {
      flagsMap[f.key] = {
        enabled: f.enabled,
        metadata: f.metadata,
      };
    });

    return NextResponse.json({
      flags: flagsMap,
      milestones,
    });
  } catch (error) {
    return NextResponse.json({ flags: {}, milestones: [] }, { status: 500 });
  }
}
