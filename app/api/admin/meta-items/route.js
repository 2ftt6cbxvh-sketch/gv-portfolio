import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const count = await prisma.metaItem.count({ where: { modeId: body.modeId } });
  const item = await prisma.metaItem.create({
    data: { modeId: body.modeId, label: body.label || "", value: body.value || "", order: count },
  });
  return NextResponse.json(item);
});
