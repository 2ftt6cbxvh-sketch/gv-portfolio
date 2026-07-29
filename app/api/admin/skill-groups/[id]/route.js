import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const PATCH = withAdmin(async (req, { params }) => {
  const body = await req.json();
  const data = {};
  for (const key of ["label", "order"]) {
    if (key in body) data[key] = body[key];
  }
  const updated = await prisma.skillGroup.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
});

export const DELETE = withAdmin(async (_req, { params }) => {
  await prisma.skillGroup.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
