/**
 * Advanced Cyber Telemetry & Geolocation Intelligence Engine
 * Provides ultra-precise GPS coordinates, Google Maps pins, hardware device model parsing,
 * and proxy/VPN location integrity verification.
 */

function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "🌐";
  }
}

/**
 * Parses user-agent string to extract exact OS, device hardware model, and browser engine.
 */
export function parseDeviceDetails(userAgent = "") {
  if (!userAgent || userAgent === "Unknown Device") {
    return {
      deviceType: "Unknown Device",
      os: "Unknown OS",
      browser: "Unknown Browser",
      summary: "Unknown Device Signature",
    };
  }

  const ua = userAgent.trim();

  // 1. Detect Operating System & Exact Hardware Model
  let os = "Unknown OS";
  let deviceType = "Desktop PC";

  if (/iPhone/i.test(ua)) {
    deviceType = "📱 Apple iPhone";
    const iosMatch = ua.match(/OS (\d+[_.]\d+)/);
    os = iosMatch ? `iOS ${iosMatch[1].replace("_", ".")}` : "iOS";
  } else if (/iPad/i.test(ua)) {
    deviceType = "📱 Apple iPad";
    const iosMatch = ua.match(/OS (\d+[_.]\d+)/);
    os = iosMatch ? `iPadOS ${iosMatch[1].replace("_", ".")}` : "iPadOS";
  } else if (/Android/i.test(ua)) {
    deviceType = "📱 Android Mobile";
    const androidMatch = ua.match(/Android\s+([\d.]+)/i);
    const modelMatch = ua.match(/;\s*([^;)]+)\s+Build/i);
    const model = modelMatch ? modelMatch[1].trim() : "";
    const androidVer = androidMatch ? `Android ${androidMatch[1]}` : "Android";
    os = model ? `${model} (${androidVer})` : androidVer;
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceType = "💻 Apple Mac";
    const macMatch = ua.match(/Mac OS X (\d+[_.]\d+([_.]\d+)?)/);
    os = macMatch ? `macOS ${macMatch[1].replace(/_/g, ".")}` : "macOS";
  } else if (/Windows NT/i.test(ua)) {
    deviceType = "🖥️ Windows PC";
    if (/Windows NT 10.0/i.test(ua)) os = "Windows 10/11";
    else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
    else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
    else os = "Windows";
  } else if (/Linux/i.test(ua)) {
    deviceType = "💻 Linux Workstation";
    os = "Linux (x86_64)";
  }

  // 2. Detect Browser Engine
  let browser = "Unknown Browser";
  if (/Edg\//i.test(ua)) {
    const v = ua.match(/Edg\/([\d.]+)/);
    browser = `Microsoft Edge ${v ? v[1].split(".")[0] : ""}`;
  } else if (/Chrome\//i.test(ua) && !/Chromium|Edg|OPR/i.test(ua)) {
    const v = ua.match(/Chrome\/([\d.]+)/);
    browser = `Google Chrome ${v ? v[1].split(".")[0] : ""}`;
  } else if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) {
    const v = ua.match(/Version\/([\d.]+)/);
    browser = `Apple Safari ${v ? v[1].split(".")[0] : ""}`;
  } else if (/Firefox\//i.test(ua)) {
    const v = ua.match(/Firefox\/([\d.]+)/);
    browser = `Mozilla Firefox ${v ? v[1].split(".")[0] : ""}`;
  } else if (/OPR\//i.test(ua)) {
    browser = "Opera";
  }

  const summary = `${deviceType} • ${os} • ${browser}`;
  return { deviceType, os, browser, summary };
}

/**
 * Ultra-precise Geolocation, Autonomous System, and Proxy verification engine.
 */
export async function getDetailedTelemetry(ip = "127.0.0.1", userAgent = "") {
  const device = parseDeviceDetails(userAgent);

  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return {
      ip,
      location: "🏠 Local Development Server (India)",
      city: "Localhost",
      region: "Local Network",
      country: "India",
      countryCode: "IN",
      flag: "🏠",
      postalCode: "N/A",
      coordinates: "17.3850, 78.4867",
      googleMapsUrl: "https://www.google.com/maps?q=17.3850,78.4867",
      isp: "Internal Localhost",
      asOrg: "Loopback Interface",
      isProxy: false,
      integrityStatus: "🟢 GENUINE LOCAL SERVER",
      device,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800); // 1.8s timeout

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,proxy,hosting`,
      { signal: controller.signal }
    ).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.status === "success") {
        const flag = getCountryFlag(data.countryCode);
        const city = data.city || "Unknown City";
        const region = data.regionName || "";
        const country = data.country || "Unknown Country";
        const postal = data.zip ? ` (PIN/ZIP: ${data.zip})` : "";
        const location = `${flag} ${city}${region ? ", " + region : ""}, ${country}${postal}`;

        const lat = data.lat?.toFixed(4) || "0";
        const lon = data.lon?.toFixed(4) || "0";
        const coordinates = `${lat}, ${lon}`;
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

        const isProxy = Boolean(data.proxy);
        const isHosting = Boolean(data.hosting);
        const isSuspicious = isProxy || (isHosting && !isIndianConsumerCarrier(data.isp));

        const integrityStatus = isProxy
          ? "🔴 ACTIVE VPN / PROXY SERVER DETECTED"
          : isSuspicious
          ? "🟡 CLOUD / DATACENTER NODE"
          : "🟢 GENUINE RESIDENTIAL / MOBILE BROADBAND";

        return {
          ip,
          location,
          city,
          region,
          country,
          countryCode: data.countryCode || "UN",
          flag,
          postalCode: data.zip || "N/A",
          coordinates,
          googleMapsUrl,
          isp: data.isp || data.org || "Unknown ISP",
          asOrg: data.as || data.org || "Unknown AS",
          isProxy: isSuspicious,
          integrityStatus,
          device,
        };
      }
    }
  } catch (e) {}

  return {
    ip,
    location: "🌐 Unknown Location",
    city: "Unknown",
    region: "",
    country: "Unknown",
    countryCode: "UN",
    flag: "🌐",
    postalCode: "N/A",
    coordinates: "0, 0",
    googleMapsUrl: "",
    isp: "Unknown Carrier",
    asOrg: "Unknown ASN",
    isProxy: false,
    integrityStatus: "⚪ UNVERIFIED ROUTE",
    device,
  };
}

function isIndianConsumerCarrier(isp = "") {
  const clean = isp.toLowerCase();
  return (
    clean.includes("jio") ||
    clean.includes("airtel") ||
    clean.includes("vodafone") ||
    clean.includes("bsnl") ||
    clean.includes("act fibernet") ||
    clean.includes("hathway") ||
    clean.includes("tata teleservices") ||
    clean.includes("railwire") ||
    clean.includes("you broadband") ||
    clean.includes("gtpl")
  );
}
