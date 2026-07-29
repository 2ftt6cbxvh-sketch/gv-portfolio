import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/apiGuard";
import { getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

const EDITABLE = ["name", "initials", "email", "location", "resumeUrl", "githubUrl", "linkedinUrl", "twitterUrl"];

export const GET = withAdmin(async () => {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
});

export const PATCH = withAdmin(async (req) => {
  const settings = await getSiteSettings();
  const body = await req.json();
  const data = {};
  for (const key of EDITABLE) {
    if (key in body) data[key] = body[key];
  }
  const updated = await prisma.siteSettings.update({ where: { id: settings.id }, data });
  return NextResponse.json(updated);
});
