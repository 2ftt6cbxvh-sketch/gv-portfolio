import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const defaults = [
    { key: "landing.logoColor", value: "#00f0ff" },
    { key: "landing.sparkColor", value: "#00ffff" },
    { key: "editor.accent", value: "#a56ce8" },
    { key: "analyst.accent", value: "#ff0f06" },
    { key: "developer.accent", value: "#fffc00" },
  ];
  for (const d of defaults) {
    const existing = await prisma.themeToken.findUnique({ where: { key: d.key } });
    if (!existing) {
      await prisma.themeToken.create({ data: d });
    }
  }
  const rows = await prisma.themeToken.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(rows);
});
