import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Check Emergency Killswitch
    const killFlag = await prisma.featureFlag.findUnique({
      where: { key: "emergency_killswitch" },
    });

    let killActive = !!killFlag?.enabled;

    // Check timed auto-lockdown expiration
    if (killActive && killFlag?.metadata) {
      try {
        const parsed = typeof killFlag.metadata === "string" ? JSON.parse(killFlag.metadata) : killFlag.metadata;
        if (parsed.autoUnlockAt && Date.now() > parsed.autoUnlockAt) {
          killActive = false;
          await prisma.featureFlag.upsert({
            where: { key: "emergency_killswitch" },
            update: { enabled: false, metadata: "" },
            create: { key: "emergency_killswitch", name: "Emergency Killswitch 503", enabled: false, metadata: "" },
          });
        }
      } catch (e) {}
    }

    // 2. Check Under Maintenance Mode
    const maintFlag = await prisma.featureFlag.findUnique({
      where: { key: "under_maintenance_mode" },
    });

    let maintActive = !!maintFlag?.enabled;
    let maintMeta = null;

    if (maintActive && maintFlag?.metadata) {
      try {
        maintMeta = typeof maintFlag.metadata === "string" ? JSON.parse(maintFlag.metadata) : maintFlag.metadata;
        // Check timed auto-restore expiration if set
        if (maintMeta.autoRestoreAt && Date.now() > maintMeta.autoRestoreAt) {
          maintActive = false;
          await prisma.featureFlag.upsert({
            where: { key: "under_maintenance_mode" },
            update: { enabled: false, metadata: "" },
            create: { key: "under_maintenance_mode", name: "Under Maintenance Mode", enabled: false, metadata: "" },
          });
        }
      } catch (e) {}
    }

    const response = NextResponse.json({
      active: killActive,
      maintenance: {
        active: maintActive,
        metadata: maintMeta,
      },
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (err) {
    return NextResponse.json({ active: false, maintenance: { active: false, metadata: null } });
  }
}
