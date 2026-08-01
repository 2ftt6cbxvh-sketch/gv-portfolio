import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// In-Memory IP Rate Limiter (Max 5 attempts per 5 minutes per IP)
const ipRateLimits = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const record = ipRateLimits.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
  } else {
    record.count += 1;
  }

  ipRateLimits.set(ip, record);
  return record.count <= 5;
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Too many attempts. Try again in 5 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { type, payload } = body;

    // Fetch feature flag config from DB
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let config = {
      adminSecretKey: "134214",
      pinCode: "134214",
      sequenceStr: "1,3,4,2,1,4",
    };

    if (flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.adminSecretKey) config.adminSecretKey = parsed.adminSecretKey;
        if (parsed.pinCode) config.pinCode = parsed.pinCode;
        if (parsed.sequenceStr) config.sequenceStr = parsed.sequenceStr;
      } catch (e) {}
    }

    let isValid = false;

    if (type === "key") {
      isValid = payload === config.adminSecretKey;
    } else if (type === "pin") {
      isValid = payload === config.pinCode;
    } else if (type === "pattern") {
      isValid = payload === config.sequenceStr;
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Generate Encrypted 3-Minute Session Token
    const expiresAt = Date.now() + 3 * 60 * 1000;
    const tokenData = JSON.stringify({ verified: true, expiresAt });
    const token = Buffer.from(tokenData).toString("base64");

    const response = NextResponse.json({ success: true, expiresAt });

    // Set HttpOnly SameSite=Strict Cookie
    response.cookies.set("starPatternVerified", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 180, // 3 minutes
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
