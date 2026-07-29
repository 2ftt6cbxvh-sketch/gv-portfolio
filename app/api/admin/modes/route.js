import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const modes = await prisma.modeContent.findMany({
    orderBy: { order: "asc" },
    include: {
      metaItems: { orderBy: { order: "asc" } },
      skillGroups: { orderBy: { order: "asc" }, include: { skills: { orderBy: { order: "asc" } } } },
      projects: { orderBy: { order: "asc" } },
      certificates: { orderBy: { order: "asc" } },
      papers: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(modes);
});
