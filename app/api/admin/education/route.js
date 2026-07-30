import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const GET = withAdmin(async () => {
  const modes = await prisma.modeContent.findMany({
    orderBy: { order: "asc" },
    include: { education: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(modes.map(m => ({
    modeId: m.modeId,
    name: m.name,
    education: m.education,
  })));
});

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const { modeId, institution = "New Institution", degree = "", field = "",
          startYear = "", endYear = "", grade = "", description = "", visible = true } = body;
  const record = await prisma.education.create({
    data: { modeId, institution, degree, field, startYear, endYear, grade, description, visible },
  });
  return NextResponse.json(record, { status: 201 });
});
