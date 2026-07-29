import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const count = await prisma.certificate.count({ where: { modeId: body.modeId } });
  const item = await prisma.certificate.create({
    data: {
      modeId: body.modeId,
      title: body.title || "Untitled certificate",
      issuer: body.issuer || null,
      year: body.year || null,
      url: body.url || null,
      imageUrl: body.imageUrl || null,
      visible: body.visible !== false,
      order: count,
    },
  });
  return NextResponse.json(item);
});
