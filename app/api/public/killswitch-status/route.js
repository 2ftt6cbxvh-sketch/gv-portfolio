import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "emergency_killswitch" },
    });

    let active = !!flag?.enabled;

    // Check timed auto-lockdown expiration
    if (active && flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.autoUnlockAt && Date.now() > parsed.autoUnlockAt) {
          active = false;
          await prisma.featureFlag.upsert({
            where: { key: "emergency_killswitch" },
            update: { enabled: false, metadata: "" },
            create: { key: "emergency_killswitch", name: "Emergency Killswitch 503", enabled: false, metadata: "" },
          });
        }
      } catch (e) {}
    }

    const response = NextResponse.json({ active });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (err) {
    return NextResponse.json({ active: false });
  }
}
