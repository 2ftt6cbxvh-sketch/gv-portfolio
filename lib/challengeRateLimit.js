import { prisma } from "@/lib/prisma";
import { sendSecurityAlert } from "@/lib/securityAlerts";

// 6 Hours lockout after 3 consecutive failures
const LOCKOUT_DURATION_MS = 6 * 60 * 60 * 1000; // 21,600,000 ms
const MAX_FAILURES = 3;

/**
 * Checks if the Device (and IP) is allowed to generate a new 8-digit OTP challenge.
 * Bounded by hardware device fingerprint (immune to VPN and Incognito).
 */
export async function canGenerateChallenge(deviceKey, ip) {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "challenge_rate_limits" },
    });

    let records = {};
    if (flag?.metadata) {
      try {
        records = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
      } catch (e) {}
    }

    const primaryKey = deviceKey || ip || "unknown_device";
    const rec = records[primaryKey] || records[ip] || { failedCount: 0, lockedUntil: 0 };
    const now = Date.now();

    // If currently locked out:
    if (rec.lockedUntil && now < rec.lockedUntil) {
      const remainingSeconds = Math.ceil((rec.lockedUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      const remainingHours = (remainingSeconds / 3600).toFixed(1);
      return {
        allowed: false,
        reason: "MAX_FAILURES_LOCKED",
        remainingSeconds,
        remainingMinutes,
        remainingHours,
        failedCount: rec.failedCount,
        lockedDevice: primaryKey,
      };
    }

    // If lockout duration has elapsed, auto-reset counter
    if (rec.lockedUntil && now >= rec.lockedUntil) {
      rec.failedCount = 0;
      rec.lockedUntil = 0;
      records[primaryKey] = rec;
      if (ip && ip !== primaryKey) records[ip] = rec;

      await prisma.featureFlag.upsert({
        where: { key: "challenge_rate_limits" },
        update: { metadata: JSON.stringify(records) },
        create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: JSON.stringify(records) },
      });
    }

    if (rec.failedCount >= MAX_FAILURES) {
      // Lock for 6 hours
      rec.lockedUntil = now + LOCKOUT_DURATION_MS;
      records[primaryKey] = rec;
      if (ip && ip !== primaryKey) records[ip] = rec;

      await prisma.featureFlag.upsert({
        where: { key: "challenge_rate_limits" },
        update: { metadata: JSON.stringify(records) },
        create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: JSON.stringify(records) },
      });
      return {
        allowed: false,
        reason: "MAX_FAILURES_LOCKED",
        remainingSeconds: 21600,
        remainingMinutes: 360,
        remainingHours: "6.0",
        failedCount: rec.failedCount,
        lockedDevice: primaryKey,
      };
    }

    return {
      allowed: true,
      failedCount: rec.failedCount || 0,
      attemptsRemaining: MAX_FAILURES - (rec.failedCount || 0),
    };
  } catch (err) {
    console.error("[challengeRateLimit.canGenerateChallenge]", err);
    return { allowed: true, failedCount: 0, attemptsRemaining: MAX_FAILURES };
  }
}

/**
 * Records a failed challenge for a specific device (and associated IP).
 * Triggers 6-hour lockout once failedCount reaches 3.
 */
export async function recordChallengeFailed(deviceKey, ip) {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "challenge_rate_limits" },
    });

    let records = {};
    if (flag?.metadata) {
      try {
        records = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
      } catch (e) {}
    }

    const primaryKey = deviceKey || ip || "unknown_device";
    const rec = records[primaryKey] || records[ip] || { failedCount: 0, lockedUntil: 0 };
    rec.failedCount = (rec.failedCount || 0) + 1;
    rec.lastFailedAt = Date.now();

    const isNowLocked = rec.failedCount >= MAX_FAILURES;
    if (isNowLocked) {
      rec.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      await sendSecurityAlert({
        type: "ADMIN_GATEWAY_LOCKED_6H",
        details: `🚫 3 consecutive 8-digit OTP challenges failed. Admin gateway locked for 6 HOURS for Device: ${primaryKey} (IP: ${ip || "N/A"})`,
        ip,
      });
    }

    records[primaryKey] = rec;
    if (ip && ip !== primaryKey) records[ip] = rec;

    await prisma.featureFlag.upsert({
      where: { key: "challenge_rate_limits" },
      update: { metadata: JSON.stringify(records) },
      create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: JSON.stringify(records) },
    });

    return {
      failedCount: rec.failedCount,
      isNowLocked,
      attemptsRemaining: Math.max(0, MAX_FAILURES - rec.failedCount),
    };
  } catch (err) {
    console.error("[challengeRateLimit.recordChallengeFailed]", err);
    return { failedCount: 0, isNowLocked: false, attemptsRemaining: MAX_FAILURES };
  }
}

/**
 * Resets the failure counter to 0 upon any successful Telegram authentication.
 * Clears failures for both the device and associated IP.
 */
export async function recordChallengeSuccess(deviceKey, ip) {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "challenge_rate_limits" },
    });

    let records = {};
    if (flag?.metadata) {
      try {
        records = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
      } catch (e) {}
    }

    const primaryKey = deviceKey || ip;
    if (primaryKey && records[primaryKey]) {
      records[primaryKey].failedCount = 0;
      records[primaryKey].lockedUntil = 0;
      records[primaryKey].lastSuccessAt = Date.now();
    }

    if (ip && records[ip]) {
      records[ip].failedCount = 0;
      records[ip].lockedUntil = 0;
      records[ip].lastSuccessAt = Date.now();
    }

    await prisma.featureFlag.upsert({
      where: { key: "challenge_rate_limits" },
      update: { metadata: JSON.stringify(records) },
      create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: JSON.stringify(records) },
    });

    return { success: true, failedCount: 0 };
  } catch (err) {
    console.error("[challengeRateLimit.recordChallengeSuccess]", err);
    return { success: true, failedCount: 0 };
  }
}

/**
 * Admin manual unlock (e.g. via Telegram /unlock command)
 */
export async function unlockAllChallenges() {
  try {
    await prisma.featureFlag.upsert({
      where: { key: "challenge_rate_limits" },
      update: { metadata: "{}" },
      create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: "{}" },
    });
    return true;
  } catch (e) {
    return false;
  }
}
