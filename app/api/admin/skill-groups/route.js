import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const count = await prisma.skillGroup.count({ where: { modeId: body.modeId } });
  const group = await prisma.skillGroup.create({
    data: { modeId: body.modeId, label: body.label || "New group", order: count },
  });
  return NextResponse.json(group);
});
