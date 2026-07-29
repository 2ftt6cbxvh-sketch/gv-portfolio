import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const count = await prisma.paper.count({ where: { modeId: body.modeId } });
  const item = await prisma.paper.create({
    data: {
      modeId: body.modeId,
      title: body.title || "Untitled paper",
      venue: body.venue || null,
      year: body.year || null,
      url: body.url || null,
      visible: body.visible !== false,
      order: count,
    },
  });
  return NextResponse.json(item);
});
