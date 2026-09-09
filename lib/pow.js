import crypto from "crypto";

/**
 * Zero-Cost Cryptographic Proof-of-Work (PoW) Engine
 * Protects administrative vaults from automated brute-force fuzzers & dictionary attacks.
 * Browser client solves a 30-50ms SHA-256 micro-puzzle before submitting sensitive credentials.
 */

const DEFAULT_DIFFICULTY = 3; // 3 leading zero characters in hex (e.g. "000...")
const MAX_CHALLENGE_AGE_MS = 2 * 60 * 1000; // 2 minutes validity

/**
 * Generates a signed cryptographic challenge string with embedded timestamp.
 */
export function generatePoWChallenge(secret = process.env.NEXTAUTH_SECRET || "gv-cyber-pow-salt") {
  const timestamp = Date.now();
  const randomSalt = crypto.randomBytes(8).toString("hex");
  const payload = `${timestamp}:${randomSalt}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex").slice(0, 16);
  return `${payload}:${signature}`;
}

/**
 * Verifies a solved challenge and nonce.
 */
export function verifyPoW(challengeStr, nonce, difficulty = DEFAULT_DIFFICULTY, secret = process.env.NEXTAUTH_SECRET || "gv-cyber-pow-salt") {
  if (!challengeStr || nonce === undefined || nonce === null) return false;

  try {
    const parts = challengeStr.split(":");
    if (parts.length !== 3) return false;

    const [timestampStr, randomSalt, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    // Check challenge expiration (prevents replay attacks)
    if (isNaN(timestamp) || now - timestamp > MAX_CHALLENGE_AGE_MS || timestamp > now + 5000) {
      return false;
    }

    // Verify HMAC signature integrity
    const expectedSig = crypto.createHmac("sha256", secret).update(`${timestampStr}:${randomSalt}`).digest("hex").slice(0, 16);
    if (signature !== expectedSig) {
      return false;
    }

    // Verify hash difficulty
    const hash = crypto.createHash("sha256").update(`${challengeStr}:${nonce}`).digest("hex");
    const targetPrefix = "0".repeat(difficulty);
    return hash.startsWith(targetPrefix);
  } catch (e) {
    return false;
  }
}
