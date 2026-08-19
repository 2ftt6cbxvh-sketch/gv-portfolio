/**
 * Zero-Cost VPN & Datacenter Proxy Detector
 * Uses IP-API threat intelligence to identify NordVPN, ExpressVPN, Surfshark,
 * ProtonVPN, Tor exit nodes, and malicious anonymity proxies.
 *
 * Whitelist: Cloudflare CDN Reverse Proxies, Apple iCloud Private Relay,
 * University / Educational Networks, and Consumer ISPs globally (UK, US, EU, India).
 */

const vpnCache = new Map();

// Global Consumer ISPs, CDNs, Mobile Carriers & Educational Networks
const CONSUMER_ISPS = [
  // CDNs & Cloud Edge
  "cloudflare",
  "apple",
  "icloud",
  "fastly",
  "akamai",
  "google",
  "microsoft",
  "starlink",
  "spacex",

  // Indian Telecom / Broadband
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
  "tikona",
  "you broadband",
  "gtpl",
  "asianet",

  // UK & European Telecom / Broadband
  "bt",
  "british telecommunications",
  "virgin",
  "virgin media",
  "sky",
  "talktalk",
  "ee",
  "three",
  "o2",
  "vodafone uk",
  "plusnet",
  "hyperoptic",
  "community fibre",
  "orange",
  "deutsche telekom",
  "telecom italia",
  "telefonica",
  "movistar",
  "free sas",
  "sfr",
  "bouygues",
  "kpn",
  "proximus",
  "swisscom",

  // US & Americas Telecom / Broadband
  "verizon",
  "at&t",
  "comcast",
  "xfinity",
  "spectrum",
  "charter",
  "t-mobile",
  "cox",
  "optimum",
  "altice",
  "frontier",
  "centurylink",
  "lumen",
  "windstream",
  "bell canada",
  "rogers",
  "telus",
  "shaw",

  // Educational / University Networks
  "eduroam",
  "janet",
  "university",
  "college",
  "campus",
  "education",
  "academic",
  "nkn",
  "ernis",

  // General Residential / Consumer Identifiers
  "broadband",
  "telecom",
  "cable",
  "fiber",
  "ftth",
  "wireless",
  "cellular",
  "mobile",
  "residential",
  "consumer",
  "dynamic",
  "cgnat",
];

// Cloudflare IPv4 ranges (never flag Cloudflare edge proxy IPs)
function isCloudflareIp(ip) {
  if (!ip) return false;
  if (
    ip.startsWith("173.245.") ||
    ip.startsWith("103.21.") ||
    ip.startsWith("103.22.") ||
    ip.startsWith("103.31.") ||
    ip.startsWith("141.101.") ||
    ip.startsWith("108.162.") ||
    ip.startsWith("190.93.") ||
    ip.startsWith("188.114.") ||
    ip.startsWith("197.234.") ||
    ip.startsWith("198.41.") ||
    ip.startsWith("162.158.") ||
    ip.startsWith("104.16.") ||
    ip.startsWith("104.17.") ||
    ip.startsWith("104.18.") ||
    ip.startsWith("104.19.") ||
    ip.startsWith("104.20.") ||
    ip.startsWith("104.21.") ||
    ip.startsWith("104.22.") ||
    ip.startsWith("104.23.") ||
    ip.startsWith("104.24.") ||
    ip.startsWith("172.64.") ||
    ip.startsWith("172.65.") ||
    ip.startsWith("172.66.") ||
    ip.startsWith("172.67.") ||
    ip.startsWith("172.68.") ||
    ip.startsWith("172.69.") ||
    ip.startsWith("172.70.") ||
    ip.startsWith("172.71.") ||
    ip.startsWith("131.0.72.")
  ) {
    return true;
  }
  return false;
}

export async function isVpnOrProxy(ip) {
  try {
    if (
      !ip ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.16.") ||
      ip.startsWith("172.17.") ||
      ip.startsWith("172.18.") ||
      ip.startsWith("172.19.") ||
      ip.startsWith("172.2") ||
      ip.startsWith("172.30.") ||
      ip.startsWith("172.31.") ||
      isCloudflareIp(ip)
    ) {
      return false;
    }

    // Check in-memory cache (valid for 1 hour)
    const cached = vpnCache.get(ip);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.isVpn;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,isp,org,as,proxy,hosting`, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.status === "success") {
        const ispName = String(data.isp || "").toLowerCase();
        const orgName = String(data.org || "").toLowerCase();
        const asName = String(data.as || "").toLowerCase();

        // Check if provider is Cloudflare, Apple Private Relay, educational or legitimate consumer ISP
        const isWhitelisted = CONSUMER_ISPS.some(
          (keyword) =>
            ispName.includes(keyword) ||
            orgName.includes(keyword) ||
            asName.includes(keyword)
        );

        let isVpn = false;
        if (isWhitelisted) {
          // Whitelisted CDN, consumer ISP, or educational network is NEVER blocked
          isVpn = false;
        } else {
          // Only flag as VPN if explicitly confirmed as a proxy/VPN service
          isVpn = Boolean(data.proxy);
        }

        vpnCache.set(ip, { isVpn, expiresAt: Date.now() + 60 * 60 * 1000 });
        return isVpn;
      }
    }
  } catch (e) {}

  return false;
}
