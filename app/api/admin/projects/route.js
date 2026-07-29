import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const count = await prisma.project.count({ where: { modeId: body.modeId } });
  const item = await prisma.project.create({
    data: {
      modeId: body.modeId,
      title: body.title || "Untitled project",
      description: body.description || "",
      stack: Array.isArray(body.stack) ? body.stack : [],
      url: body.url || null,
      imageUrl: body.imageUrl || null,
      featured: !!body.featured,
      visible: body.visible !== false,
      order: count,
    },
  });
  return NextResponse.json(item);
});
