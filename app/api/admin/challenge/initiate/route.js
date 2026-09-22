import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { canGenerateChallenge, recordChallengeFailed } from "@/lib/challengeRateLimit";

const ADMIN_TELEGRAM_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHALLENGE_TTL_MS = 30_000; // 30 seconds

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function POST(req) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rawUserAgent = req.headers.get("user-agent") || "";

    let body = {};
    try {
      body = await req.json();
    } catch (_) {}

    const deviceFingerprint =
      req.headers.get("x-device-fingerprint") ||
      body.deviceFingerprint ||
      "";

    const deviceKey = deviceFingerprint || ip;

    // 1. Check if previous challenge from this device/IP expired unverified -> count as failure
    const lastUnverified = await prisma.adminChallenge.findFirst({
      where: {
        OR: [
          { ipAddress: ip, verified: false },
          ...(deviceFingerprint ? [{ userAgent: { contains: deviceFingerprint }, verified: false }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastUnverified && new Date() > lastUnverified.expiresAt) {
      await recordChallengeFailed(deviceKey, ip);
      await prisma.adminChallenge.delete({ where: { id: lastUnverified.id } }).catch(() => {});
    }

    // 2. Max 3 consecutive failures check (Device-bounded: immune to VPN & Incognito!)
    const check = await canGenerateChallenge(deviceKey, ip);
    if (!check.allowed) {
      return NextResponse.json(
        {
          error: "Maximum 3 consecutive OTP challenge failures exceeded. Gateway locked for 6 hours.",
          remainingHours: check.remainingHours,
          remainingMinutes: check.remainingMinutes,
          locked: true,
        },
        { status: 429 }
      );
    }

    // --- Generate cryptographically random 8-digit code ---
    // crypto.randomBytes(4) gives 32 bits → range 0 to 4,294,967,295
    // We mod to get 8 digits (10,000,000 to 99,999,999)
    const randomBuf = crypto.randomBytes(4);
    const randomInt = randomBuf.readUInt32BE(0);
    const code = String(10_000_000 + (randomInt % 90_000_000)); // always 8 digits

    // --- Hash with bcrypt (12 rounds) — never store plaintext ---
    const codeHash = await bcrypt.hash(code, 12);

    // --- Store challenge in DB with device fingerprint binding ---
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
    const combinedUserAgent = `${deviceFingerprint}@@${rawUserAgent}`;
    const challenge = await prisma.adminChallenge.create({
      data: { codeHash, expiresAt, ipAddress: ip, userAgent: combinedUserAgent },
    });

    // --- Fire Telegram DM to admin ---
    await sendTelegramMessage(
      ADMIN_TELEGRAM_CHAT_ID,
      `🔐 <b>Admin Gateway Challenge</b>\n\n` +
      `Someone (IP: <code>${ip}</code>) triggered the long-press admin gateway.\n\n` +
      `<b>Enter the code shown on the screen to authenticate:</b>\n` +
      `⏳ Expires in <b>30 seconds</b>\n\n` +
      `Reply with the 8-digit code displayed on screen.\n` +
      `Max 3 attempts. Do NOT share this message.`
    );

    // --- Sweep expired challenges (opportunistic cleanup) ---
    await prisma.adminChallenge.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    }).catch(() => {});

    // Return challengeId + plaintext code (shown once, never logged)
    // The code is visible on screen — security relies on Telegram ownership
    const response = NextResponse.json({
      challengeId: challenge.id,
      code, // shown on screen only — never stored or logged
      expiresAt: expiresAt.toISOString(),
    });

    // Bind challengeId in httpOnly cookie (secondary binding)
    response.cookies.set("admin_cid", challenge.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 35, // slightly over 30s
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[admin/challenge/initiate]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
