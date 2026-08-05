/**
 * Zero-Cost VPN & Datacenter Proxy Detector
 * Uses IP-API threat intelligence to identify NordVPN, ExpressVPN, Surfshark,
 * ProtonVPN, Tor exit nodes, and AWS/DigitalOcean proxy servers.
 * Robust fail-safe design: Returns false on timeout/error so legitimate users are never blocked by network glitches.
 */

const vpnCache = new Map();

export async function isVpnOrProxy(ip) {
  try {
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
      return false;
    }

    // Check in-memory cache (valid for 1 hour)
    const cached = vpnCache.get(ip);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.isVpn;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1.0s fast timeout

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,proxy,hosting`, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.status === "success") {
        const isVpn = Boolean(data.proxy || data.hosting);
        vpnCache.set(ip, { isVpn, expiresAt: Date.now() + 60 * 60 * 1000 });
        return isVpn;
      }
    }
  } catch (e) {}

  return false;
}
