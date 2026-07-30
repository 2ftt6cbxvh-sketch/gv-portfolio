import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Never cache — admin changes must be reflected immediately on the frontend
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    return NextResponse.json(
      { flags: flagsMap, milestones },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ flags: {}, milestones: [] }, { status: 500 });
  }
}
