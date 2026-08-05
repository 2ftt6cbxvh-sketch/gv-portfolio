import { NextResponse } from "next/server";
import { isVpnOrProxy } from "@/lib/vpnCheck";

export async function GET(req) {
  try {
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Device";

    const vpnActive = await isVpnOrProxy(ip);

    return NextResponse.json({
      isVpn: vpnActive,
      ip,
      userAgent,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    });
  } catch (error) {
    return NextResponse.json({ isVpn: false });
  }
}
