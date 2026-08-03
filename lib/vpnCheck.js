/**
 * Zero-Cost VPN & Datacenter Proxy Detector
 * Uses IP-API threat intelligence to identify NordVPN, ExpressVPN, Surfshark,
 * ProtonVPN, Tor exit nodes, and AWS/DigitalOcean proxy servers.
 */

const vpnCache = new Map();

export async function isVpnOrProxy(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
    return false;
  }

  // Check in-memory cache (valid for 1 hour)
  const cached = vpnCache.get(ip);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.isVpn;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout fast-path

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,proxy,hosting`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        const isVpn = Boolean(data.proxy || data.hosting);
        vpnCache.set(ip, { isVpn, expiresAt: Date.now() + 60 * 60 * 1000 });
        return isVpn;
      }
    }
  } catch (e) {}

  return false;
}
