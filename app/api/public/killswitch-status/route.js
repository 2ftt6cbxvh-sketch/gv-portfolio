import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "emergency_killswitch" },
    });

    const response = NextResponse.json({ active: !!flag?.enabled });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (err) {
    return NextResponse.json({ active: false });
  }
}
