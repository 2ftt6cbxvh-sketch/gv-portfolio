import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const count = await prisma.achievement.count({ where: { modeId: body.modeId } });
  const item = await prisma.achievement.create({
    data: {
      modeId: body.modeId,
      title: body.title || "Untitled achievement",
      description: body.description || "",
      year: body.year || null,
      visible: body.visible !== false,
      order: count,
    },
  });
  return NextResponse.json(item);
});
