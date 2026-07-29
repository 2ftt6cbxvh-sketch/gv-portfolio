import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

export const PATCH = withAdmin(async (req, { params }) => {
  const body = await req.json();
  const updated = await prisma.themeToken.update({
    where: { key: params.key },
    data: { value: body.value },
  });
  return NextResponse.json(updated);
});
