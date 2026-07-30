import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const milestones = await prisma.journeyMilestone.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(milestones);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    const milestone = await prisma.journeyMilestone.create({
      data: {
        year: data.year || "2026",
        title: data.title || "New Milestone",
        institution: data.institution || "",
        location: data.location || "",
        description: data.description || "",
        tags: data.tags || [],
        visible: data.visible !== false,
        order: data.order || 0,
      },
    });
    return NextResponse.json(milestone);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
