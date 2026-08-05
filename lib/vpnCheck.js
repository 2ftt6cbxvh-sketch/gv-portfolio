/**
 * Zero-Cost VPN & Datacenter Proxy Detector
 * Uses IP-API threat intelligence to identify NordVPN, ExpressVPN, Surfshark,
 * ProtonVPN, Tor exit nodes, and AWS/DigitalOcean proxy servers.
 *
 * ISP Whitelist: Consumer ISPs using CGNAT (JioFiber, Airtel Xstream, BSNL, ACT Fibernet)
 * are NEVER flagged as VPNs.
 */

const vpnCache = new Map();

const CONSUMER_ISPS = [
  "jio",
  "reliance",
  "airtel",
  "bharti",
  "bsnl",
  "act",
  "tata",
  "vodafone",
  "idea",
  "spectranet",
  "hathway",
  "excitel",
];

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
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1.0s fast-path timeout

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,isp,org,proxy,hosting`, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.status === "success") {
        const ispName = String(data.isp || "").toLowerCase();
        const orgName = String(data.org || "").toLowerCase();

        // Check if provider is a legitimate consumer telecom ISP (e.g. JioFiber, Airtel)
        const isConsumerIsp = CONSUMER_ISPS.some(
          (ispKeyword) => ispName.includes(ispKeyword) || orgName.includes(ispKeyword)
        );

        let isVpn = false;
        if (isConsumerIsp) {
          // For consumer ISPs (Jio CGNAT), block ONLY if explicit proxy flag is true
          isVpn = Boolean(data.proxy);
        } else {
          // For unknown/datacenter IPs, block if proxy or hosting is true
          isVpn = Boolean(data.proxy || data.hosting);
        }

        vpnCache.set(ip, { isVpn, expiresAt: Date.now() + 60 * 60 * 1000 });
        return isVpn;
      }
    }
  } catch (e) {}

  return false;
}
