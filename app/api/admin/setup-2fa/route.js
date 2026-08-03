import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBase32Secret, getOTPAuthURL, verifyTOTP } from "@/lib/totp";

// GET: Generate a new candidate 2FA secret and OTPAuth URL
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = generateBase32Secret(16);
    const otpauthUrl = getOTPAuthURL(secret, "admin@ganeshvarma.in", "GV Cyber Vault");

    return NextResponse.json({
      secret,
      otpauthUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate 2FA secret" }, { status: 500 });
  }
}

// POST: Verify candidate code and enable/disable 2FA in DB
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, secret, code } = await req.json();

    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let currentMeta = {};
    if (flag?.metadata) {
      try {
        currentMeta = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
      } catch (e) {}
    }

    if (action === "disable") {
      const updatedMeta = {
        ...currentMeta,
        totpSecret: "",
        is2FAEnabled: false,
      };

      await prisma.featureFlag.upsert({
        where: { key: "admin_secret_gateway" },
        update: { metadata: JSON.stringify(updatedMeta) },
        create: { key: "admin_secret_gateway", name: "Secret Admin Gateway", metadata: JSON.stringify(updatedMeta) },
      });

      return NextResponse.json({ success: true, is2FAEnabled: false, message: "2FA Disabled successfully" });
    }

    if (action === "enable") {
      if (!secret || !code) {
        return NextResponse.json({ error: "Secret and 6-digit verification code required" }, { status: 400 });
      }

      const isValid = verifyTOTP(secret, code);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid 6-digit verification code. Please check Apple Passwords App / Authenticator." }, { status: 400 });
      }

      const updatedMeta = {
        ...currentMeta,
        totpSecret: secret,
        is2FAEnabled: true,
      };

      await prisma.featureFlag.upsert({
        where: { key: "admin_secret_gateway" },
        update: { metadata: JSON.stringify(updatedMeta) },
        create: { key: "admin_secret_gateway", name: "Secret Admin Gateway", metadata: JSON.stringify(updatedMeta) },
      });

      return NextResponse.json({ success: true, is2FAEnabled: true, message: "2FA Enabled successfully!" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update 2FA configuration" }, { status: 500 });
  }
}
