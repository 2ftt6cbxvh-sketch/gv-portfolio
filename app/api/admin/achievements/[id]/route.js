import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

const EDITABLE = ["title", "description", "year", "visible", "order"];

export const PATCH = withAdmin(async (req, { params }) => {
  const body = await req.json();
  const data = {};
  for (const key of EDITABLE) {
    if (key in body) data[key] = body[key];
  }
  const updated = await prisma.achievement.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
});

export const DELETE = withAdmin(async (_req, { params }) => {
  await prisma.achievement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
