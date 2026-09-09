import { NextResponse } from "next/server";
import { sendSecurityAlert } from "@/lib/securityAlerts";
import { getDetailedTelemetry } from "@/lib/telemetry";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SECRET_ANSWER = "GV_NEURAL_KERNEL_2026";
const XOR_KEY = 0x5a;

function encodePayload(str) {
  const buf = Buffer.from(str, "utf8");
  for (let i = 0; i < buf.length; i++) {
    buf[i] = buf[i] ^ XOR_KEY;
  }
  return buf.toString("base64");
}

export async function GET(req) {
  const encoded = encodePayload(SECRET_ANSWER);

  return NextResponse.json({
    protocol: "GV-CYBER-CTF // LEVEL-01",
    author: "Buddaraju Ganesh Sai Varma (Ganesh Varma)",
    institution: "University of Liverpool MSc AI & Data Science",
    message: "Greetings, engineer. If you are inspecting this network trace, you have hacker curiosity.",
    instructions: "Decode the obfuscated payload using XOR key 0x5A, then POST your solution to this endpoint to unlock Cyber Matrix Mode and alert Ganesh.",
    challenge: {
      cipherText: encoded,
      algorithm: "BASE64(PLAINTEXT ^ 0x5A)",
      clue: "Bitwise XOR with decimal 90 (0x5A)",
      submissionEndpoint: "/api/public/challenge",
      expectedPayload: "{ \"answer\": \"YOUR_DECODED_STRING\", \"candidateName\": \"Your Name / Handle\", \"candidateContact\": \"Your LinkedIn / Email\" }"
    },
    hint: "Buffer.from(cipherText, 'base64').map(byte => byte ^ 0x5a).toString()",
    timestamp: Date.now(),
  }, {
    headers: {
      "X-Powered-By": "GV Cyber Defense Engine",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(req) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const cfIp = req.headers.get("cf-connecting-ip");
    const realIp = req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    const ip = cfIp || realIp || (forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1");

    const body = await req.json().catch(() => ({}));
    const { answer, candidateName, candidateContact } = body;

    if (!answer || String(answer).trim().toUpperCase() !== SECRET_ANSWER) {
      return NextResponse.json({
        success: false,
        error: "Incorrect cipher key. Keep reverse engineering!",
        hint: "Run bitwise XOR 0x5A on each decoded byte.",
      }, { status: 400 });
    }

    const name = (candidateName || "Anonymous Engineer").slice(0, 80);
    const contact = (candidateContact || "Not provided").slice(0, 120);
    const telemetry = await getDetailedTelemetry(ip, userAgent);

    // Send High-Priority Telegram Alert to Ganesh Varma
    await sendSecurityAlert({
      type: "CTF_CHALLENGE_SOLVED",
      details: `🏆 DEVELOPER CTF CRACKED!\nEngineer: ${name}\nContact: ${contact}\nLocation: ${telemetry.location}\nISP: ${telemetry.isp}\nDevice: ${telemetry.device.summary}`,
      ip,
      userAgent,
    });

    const unlockToken = crypto.createHmac("sha256", "matrix-secret-2026").update(`${ip}:${Date.now()}`).digest("hex");

    return NextResponse.json({
      success: true,
      clearance: "LEVEL_1_OPERATOR_GRANTED",
      message: `🎉 Incredible work, ${name}! Your solution has been verified. A live alert was just dispatched to Ganesh Varma's personal Telegram. Cyber Matrix Mode is now unlocked on your browser!`,
      matrixUnlocked: true,
      unlockToken,
      matrixTriggerHotkey: "Press ~ (tilde) or F2 anytime to toggle Matrix Mode",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server evaluation error" }, { status: 500 });
  }
}
