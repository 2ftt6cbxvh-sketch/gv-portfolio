import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "emergency_killswitch" },
    });

    return NextResponse.json({ active: !!flag?.enabled });
  } catch (err) {
    return NextResponse.json({ active: false });
  }
}
