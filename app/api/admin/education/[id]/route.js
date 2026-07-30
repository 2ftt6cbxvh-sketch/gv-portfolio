import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const PATCH = withAdmin(async (req, { params }) => {
  const { id } = params;
  const body = await req.json();
  const { institution, degree, field, startYear, endYear, grade, description, visible } = body;
  const record = await prisma.education.update({
    where: { id },
    data: { institution, degree, field, startYear, endYear, grade, description, visible },
  });
  return NextResponse.json(record);
});

export const DELETE = withAdmin(async (req, { params }) => {
  const { id } = params;
  await prisma.education.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
