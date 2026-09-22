import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string" || id.length > 64) {
      return NextResponse.json({ error: "Invalid challenge ID" }, { status: 400 });
    }

    const challenge = await prisma.adminChallenge.findUnique({ where: { id } });

    if (!challenge) {
      return NextResponse.json({ status: "not_found" });
    }

    // Expired?
    if (new Date() > challenge.expiresAt && !challenge.verified) {
      // Destroy expired challenge
      await prisma.adminChallenge.delete({ where: { id } }).catch(() => {});
      return NextResponse.json({ status: "expired" });
    }

    // Too many attempts?
    if (challenge.attempts >= 3 && !challenge.verified) {
      await prisma.adminChallenge.delete({ where: { id } }).catch(() => {});
      return NextResponse.json({ status: "failed" });
    }

    // Verified — issue a short-lived admin session token and vault unlock key
    if (challenge.verified && challenge.sessionToken) {
      // Fetch the secret direct URL key
      const flag = await prisma.featureFlag.findUnique({
        where: { key: "admin_secret_gateway" },
      });
      let rawSecretKey = "134214";
      if (flag?.metadata) {
        try {
          const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
          if (parsed.adminSecretKey) rawSecretKey = parsed.adminSecretKey;
          else if (parsed.rawSecretKey) rawSecretKey = parsed.rawSecretKey;
        } catch (e) {}
      }

      // Encrypt the session token with AES-256-GCM before sending
      const SECRET = process.env.CHALLENGE_ENCRYPT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-32-char-secret-key-here";
      // Use first 32 bytes of sha256 of secret as key
      const keyBuf = crypto.createHash("sha256").update(SECRET).digest();
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", keyBuf, iv);
      let encrypted = cipher.update(challenge.sessionToken, "utf8", "hex");
      encrypted += cipher.final("hex");
      const authTag = cipher.getAuthTag().toString("hex");
      const payload = `${iv.toString("hex")}:${authTag}:${encrypted}`;

      // Delete challenge after token is issued (one-time use)
      await prisma.adminChallenge.delete({ where: { id } }).catch(() => {});

      const expiresAt = Date.now() + 15 * 60 * 1000;
      const tokenData = JSON.stringify({ verified: true, expiresAt });
      const tokenHash = crypto.createHash("sha256").update(tokenData).digest("hex");

      const response = NextResponse.json({
        status: "verified",
        token: payload,
        secretKey: rawSecretKey,
        expiresAt,
      });

      // Set cookie so AdminVaultSecurityShield allows access
      response.cookies.set("starPatternVerified", tokenHash, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 900,
        path: "/",
      });

      response.cookies.set("adminGatewayVerified", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 900,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({
      status: "pending",
      expiresAt: challenge.expiresAt.toISOString(),
      attempts: challenge.attempts,
    });
  } catch (err) {
    console.error("[admin/challenge/status]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
