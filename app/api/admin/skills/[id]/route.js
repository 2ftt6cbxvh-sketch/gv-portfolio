import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

// `level` is the admin-editable expertise percentage (0-100) that drives
// the animated skill bars on the public site.
export const PATCH = withAdmin(async (req, { params }) => {
  const body = await req.json();
  const data = {};
  for (const key of ["name", "level", "order"]) {
    if (key in body) data[key] = key === "level" ? Math.max(0, Math.min(100, Number(body[key]))) : body[key];
  }
  const updated = await prisma.skill.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
});

export const DELETE = withAdmin(async (_req, { params }) => {
  await prisma.skill.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
