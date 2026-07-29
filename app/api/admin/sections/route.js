import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const rows = await prisma.sectionConfig.findMany({ orderBy: [{ modeId: "asc" }, { order: "asc" }] });
  return NextResponse.json(rows);
});
