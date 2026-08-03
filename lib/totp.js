import crypto from "crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(length = 16) {
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return secret;
}

export function base32Decode(base32) {
  let bits = "";
  let hex = "";
  const cleaned = base32.replace(/=/g, "").toUpperCase();
  for (let i = 0; i < cleaned.length; i++) {
    const val = ALPHABET.indexOf(cleaned.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  return Buffer.from(hex, "hex");
}

export function generateTOTPCode(secretBase32, timeOffsetSec = 0) {
  try {
    const secret = base32Decode(secretBase32);
    const epoch = Math.floor((Date.now() / 1000 + timeOffsetSec) / 30);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(epoch, 4);

    const hmac = crypto.createHmac("sha1", secret).update(timeBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      (((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)) %
      1000000;

    return code.toString().padStart(6, "0");
  } catch (e) {
    return "";
  }
}

export function verifyTOTP(secretBase32, inputCode) {
  if (!secretBase32 || !inputCode) return false;
  const cleanInput = String(inputCode).trim();
  if (cleanInput.length !== 6) return false;

  // Allow current interval, -30s skew, and +30s skew
  const skews = [0, -30, 30];
  for (const skew of skews) {
    const expected = generateTOTPCode(secretBase32, skew);
    if (expected && expected === cleanInput) {
      return true;
    }
  }
  return false;
}

export function getOTPAuthURL(secretBase32, label = "admin@ganeshvarma.in", issuer = "GV Cyber Vault") {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}`;
}
