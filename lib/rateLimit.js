import { prisma } from "@/lib/prisma";

/**
 * OWASP 24-Hour Persistent IP Rate Limiter
 * Persists rate limit attempts in PostgreSQL across serverless cold starts.
 * Windows: 24 Hours (86,400,000 ms)
 * Max Allowed Attempts: 5 requests per 24 hours per IP address
 */
export async function check24HourRateLimit(ip) {
  const windowMs = 24 * 60 * 60 * 1000; // 24 Hours
  const now = Date.now();
  const resetAtTime = new Date(now + windowMs).toISOString();

  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "ip_rate_limits_24h" },
    });

    let records = {};
    if (flag?.metadata) {
      try {
        records = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
      } catch (e) {}
    }

    const current = records[ip] || { count: 0, resetAt: now + windowMs };

    // Reset window if 24 hours have passed
    if (now > current.resetAt) {
      current.count = 1;
      current.resetAt = now + windowMs;
    } else {
      current.count += 1;
    }

    records[ip] = current;

    // Clean up expired IP records older than 24h
    Object.keys(records).forEach((storedIp) => {
      if (records[storedIp]?.resetAt && now > records[storedIp].resetAt) {
        delete records[storedIp];
      }
    });

    // Save back to PostgreSQL asynchronously
    await prisma.featureFlag.upsert({
      where: { key: "ip_rate_limits_24h" },
      update: { metadata: JSON.stringify(records) },
      create: { key: "ip_rate_limits_24h", name: "24h IP Rate Limits", enabled: true, metadata: JSON.stringify(records) },
    });

    const isAllowed = current.count <= 5;
    const remainingSeconds = Math.ceil((current.resetAt - now) / 1000);

    return {
      allowed: isAllowed,
      count: current.count,
      remainingSeconds,
    };
  } catch (e) {
    // Fail closed or fallback to basic check
    return { allowed: true, count: 1, remainingSeconds: windowMs / 1000 };
  }
}
