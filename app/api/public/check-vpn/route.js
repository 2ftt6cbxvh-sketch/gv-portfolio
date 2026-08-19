import { NextResponse } from "next/server";
import { isVpnOrProxy } from "@/lib/vpnCheck";
import { sendSecurityAlert } from "@/lib/securityAlerts";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    const xRealIp = req.headers.get("x-real-ip");
    const xForwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = cfConnectingIp || xRealIp || xForwardedFor || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Device";

    const vpnActive = await isVpnOrProxy(ip);

    if (vpnActive) {
      await sendSecurityAlert({
        type: "VPN_ACCESS_BLOCKED",
        details: `Visitor tried to access website via active VPN / Proxy server: ${ip}`,
        ip,
        userAgent,
      });
    }

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
