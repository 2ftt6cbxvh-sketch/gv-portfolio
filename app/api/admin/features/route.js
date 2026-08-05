import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

function sha256(text) {
  return crypto.createHash("sha256").update(String(text)).digest("hex");
}

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
    return NextResponse.json(flags);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const body = await request.json();
    const { key, enabled, metadata } = body;
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

    let processedMetadata = metadata;

    if (key === "admin_secret_gateway" && metadata) {
      try {
        const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        const metaObj = { ...parsed };

        if (parsed.pinCode) {
          // OWASP-Compliant bcrypt (Cost Factor 12) - Zero-Dependency Pure JS
          metaObj.pinHash = await bcrypt.hash(String(parsed.pinCode), 12);
        }
        if (parsed.adminSecretKey) {
          metaObj.secretKeyHash = sha256(parsed.adminSecretKey);
        }
        processedMetadata = JSON.stringify(metaObj);
      } catch (e) {}
    }

    const finalMetadataStr = typeof processedMetadata === "object" ? JSON.stringify(processedMetadata) : String(processedMetadata || "");

    const updated = await prisma.featureFlag.upsert({
      where: { key },
      update: {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(metadata !== undefined ? { metadata: finalMetadataStr } : {}),
      },
      create: {
        key,
        name: key.replace(/_/g, " ").toUpperCase(),
        enabled: enabled !== undefined ? enabled : true,
        metadata: finalMetadataStr,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update feature flag: " + error.message }, { status: 500 });
  }
}
