import { prisma } from "@/lib/prisma";
import { sendSecurityAlert } from "@/lib/securityAlerts";

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout after 3 consecutive failures
const MAX_FAILURES = 3;

/**
 * Checks if the IP is allowed to generate a new 8-digit OTP challenge.
 * Enforces: maximum 3 failed challenges in a row.
 */
export async function canGenerateChallenge(ip) {
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

    const rec = records[ip] || { failedCount: 0, lockedUntil: 0 };
    const now = Date.now();

    // If currently locked out:
    if (rec.lockedUntil && now < rec.lockedUntil) {
      const remainingSeconds = Math.ceil((rec.lockedUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return {
        allowed: false,
        reason: "MAX_FAILURES_LOCKED",
        remainingSeconds,
        remainingMinutes,
        failedCount: rec.failedCount,
      };
    }

    // If lockout duration has elapsed, reset counter
    if (rec.lockedUntil && now >= rec.lockedUntil) {
      rec.failedCount = 0;
      rec.lockedUntil = 0;
      records[ip] = rec;
      await prisma.featureFlag.upsert({
        where: { key: "challenge_rate_limits" },
        update: { metadata: JSON.stringify(records) },
        create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: JSON.stringify(records) },
      });
    }

    if (rec.failedCount >= MAX_FAILURES) {
      // Lock for 15 minutes
      rec.lockedUntil = now + LOCKOUT_DURATION_MS;
      records[ip] = rec;
      await prisma.featureFlag.upsert({
        where: { key: "challenge_rate_limits" },
        update: { metadata: JSON.stringify(records) },
        create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: JSON.stringify(records) },
      });
      return {
        allowed: false,
        reason: "MAX_FAILURES_LOCKED",
        remainingSeconds: 900,
        remainingMinutes: 15,
        failedCount: rec.failedCount,
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
 * Records a failed challenge (e.g. 3 wrong Telegram replies, or 30s timer expired without entry).
 */
export async function recordChallengeFailed(ip) {
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

    const rec = records[ip] || { failedCount: 0, lockedUntil: 0 };
    rec.failedCount = (rec.failedCount || 0) + 1;
    rec.lastFailedAt = Date.now();

    const isNowLocked = rec.failedCount >= MAX_FAILURES;
    if (isNowLocked) {
      rec.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      await sendSecurityAlert({
        type: "ADMIN_GATEWAY_LOCKED",
        details: `🚫 3 consecutive 8-digit OTP challenges failed. Admin gateway locked for 15 minutes for IP: ${ip}`,
        ip,
      });
    }

    records[ip] = rec;
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
 */
export async function recordChallengeSuccess(ip) {
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

    if (records[ip]) {
      records[ip].failedCount = 0;
      records[ip].lockedUntil = 0;
      records[ip].lastSuccessAt = Date.now();

      await prisma.featureFlag.upsert({
        where: { key: "challenge_rate_limits" },
        update: { metadata: JSON.stringify(records) },
        create: { key: "challenge_rate_limits", name: "Challenge Rate Limits", metadata: JSON.stringify(records) },
      });
    }

    return { success: true, failedCount: 0 };
  } catch (err) {
    console.error("[challengeRateLimit.recordChallengeSuccess]", err);
    return { success: true, failedCount: 0 };
  }
}
