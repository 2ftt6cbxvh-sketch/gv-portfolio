import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    warmed: true,
    edgeRegion: process.env.VERCEL_REGION || "bom1",
    timestamp: Date.now(),
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Edge-Warmed": "true",
    },
  });
}
