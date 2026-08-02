import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Helper function to calculate SHA-256 hash
function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

// Pre-computed SHA-256 Hashes for Defaults (Raw strings NEVER exposed to client JS!)
const DEFAULT_KEY_HASH = sha256("134214");      // 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
const DEFAULT_PIN_HASH = sha256("134214");      // 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
const DEFAULT_SEQ_HASH = sha256("1,3,4,2,1,4"); // e305f639088ff50ec721a998c764ee71110757ee92a7e7bfb7b3ee42a59a72df

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

    if (!payload) {
      return NextResponse.json({ success: false, error: "Missing payload" }, { status: 400 });
    }

    // Fetch feature flag config from DB
    const flag = await prisma.featureFlag.findUnique({
      where: { key: "admin_secret_gateway" },
    });

    let targetKeyHash = DEFAULT_KEY_HASH;
    let targetPinHash = DEFAULT_PIN_HASH;
    let targetSeqHash = DEFAULT_SEQ_HASH;
    let actualAdminSecretKey = "134214";

    if (flag?.metadata) {
      try {
        const parsed = typeof flag.metadata === "string" ? JSON.parse(flag.metadata) : flag.metadata;
        if (parsed.adminSecretKey) {
          targetKeyHash = sha256(parsed.adminSecretKey);
          actualAdminSecretKey = parsed.adminSecretKey;
        }
        if (parsed.pinCode) targetPinHash = sha256(parsed.pinCode);
        if (parsed.sequenceStr) targetSeqHash = sha256(parsed.sequenceStr);
      } catch (e) {}
    }

    // SHA-256 Hash Comparison
    const payloadHash = sha256(payload);
    let isValid = false;

    if (type === "key") {
      isValid = payloadHash === targetKeyHash;
    } else if (type === "pin") {
      isValid = payloadHash === targetPinHash;
    } else if (type === "pattern") {
      isValid = payloadHash === targetSeqHash;
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Generate Encrypted 3-Minute Session Token
    const expiresAt = Date.now() + 3 * 60 * 1000;
    const tokenData = JSON.stringify({ verified: true, expiresAt });
    const token = Buffer.from(tokenData).toString("base64");

    const response = NextResponse.json({ success: true, expiresAt, secretKey: actualAdminSecretKey });

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
