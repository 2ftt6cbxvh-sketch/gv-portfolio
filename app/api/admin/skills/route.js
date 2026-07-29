import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const count = await prisma.skill.count({ where: { groupId: body.groupId } });
  const skill = await prisma.skill.create({
    data: {
      groupId: body.groupId,
      name: body.name || "New skill",
      level: typeof body.level === "number" ? body.level : 70,
      order: count,
    },
  });
  return NextResponse.json(skill);
});
