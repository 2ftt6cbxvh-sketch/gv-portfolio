import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";

const EDITABLE = [
  "index", "name", "desc", "accentColor", "role",
  "heroTitlePrefix", "heroTitleAccent", "heroTitleSuffix",
  "lede", "contactHeading", "visible", "order",
];

export const PATCH = withAdmin(async (req, { params }) => {
  const body = await req.json();
  const data = {};
  for (const key of EDITABLE) {
    if (key in body) data[key] = body[key];
  }
  const updated = await prisma.modeContent.update({
    where: { modeId: params.modeId },
    data,
  });
  return NextResponse.json(updated);
});
