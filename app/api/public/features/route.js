import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Never cache — admin changes must be reflected immediately on the frontend
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Keys that contain confidential secrets or internal security telemetry
const SENSITIVE_KEYS = new Set([
  "security_audit_logs",
  "ip_rate_limits_24h",
]);

/**
 * Sanitizes metadata before delivering to public unauthenticated clients.
 * Prevents leaks of Telegram tokens, chat IDs, PIN hashes, and internal telemetry.
 */
function sanitizeFlagMetadata(key, metadata) {
  if (!metadata) return "";
  if (SENSITIVE_KEYS.has(key)) return "";

  if (key === "admin_secret_gateway") {
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      // Only expose non-sensitive public state needed by client-side modals
      const safeMeta = {
        is2FAEnabled: Boolean(parsed.is2FAEnabled),
      };
      return JSON.stringify(safeMeta);
    } catch (e) {
      return "";
    }
  }

  return metadata;
}

export async function GET() {
  try {
    const [flags, milestones] = await Promise.all([
      prisma.featureFlag.findMany(),
      prisma.journeyMilestone.findMany({
        where: { visible: true },
        orderBy: { order: "asc" },
      }),
    ]);

    const flagsMap = {};
    flags.forEach((f) => {
      flagsMap[f.key] = {
        enabled: f.enabled,
        metadata: sanitizeFlagMetadata(f.key, f.metadata),
      };
    });

    return NextResponse.json(
      { flags: flagsMap, milestones },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ flags: {}, milestones: [] }, { status: 500 });
  }
}
