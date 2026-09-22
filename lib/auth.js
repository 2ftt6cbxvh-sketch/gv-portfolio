import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendSecurityAlert } from "./securityAlerts";
import { verifyTOTP } from "./totp";
import { check24HourRateLimit } from "./rateLimit";

export const authOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "TOTP Code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const emailTrimmed = credentials.email.toLowerCase().trim();

        // 1. IP extraction & 24-hour rate limit check (5 max attempts / 24h)
        const ip =
          req?.headers?.["cf-connecting-ip"] ||
          req?.headers?.["x-real-ip"] ||
          req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
          "127.0.0.1";

        try {
          const rateCheck = await check24HourRateLimit(ip);
          if (!rateCheck.allowed) {
            await sendSecurityAlert({
              type: "RATE_LIMIT_EXCEEDED",
              details: `Login locked: IP blocked for 24h after 5 failed attempts: ${ip}`,
              ip,
            });
            throw new Error("RATE_LIMITED: 24-Hour security lock active after 5 failed attempts.");
          }
        } catch (e) {
          if (e.message?.startsWith("RATE_LIMITED")) throw e;
        }

        // 2. User lookup
        const user = await prisma.adminUser.findUnique({
          where: { email: emailTrimmed },
        });

        if (!user) {
          await sendSecurityAlert({
            type: "FAILED_PASSWORD_ATTEMPT",
            details: `Failed login attempt for unknown email: ${emailTrimmed} (IP: ${ip})`,
            ip,
          });
          return null;
        }

        // 3. Password check (Bcrypt constant-time hash comparison)
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          await sendSecurityAlert({
            type: "FAILED_PASSWORD_ATTEMPT",
            details: `Invalid password entered for admin: ${emailTrimmed} (IP: ${ip})`,
            ip,
          });
          return null;
        }

        // 4. TOTP 2FA Verification (if configured in DB or env)
        const gatewayFlag = await prisma.featureFlag.findUnique({
          where: { key: "admin_secret_gateway" },
        });

        let totpSecret = process.env.ADMIN_TOTP_SECRET || "";
        let is2FAEnabled = Boolean(totpSecret);

        if (gatewayFlag?.metadata) {
          try {
            const parsed =
              typeof gatewayFlag.metadata === "string"
                ? JSON.parse(gatewayFlag.metadata)
                : gatewayFlag.metadata;
            if (parsed.totpSecret) {
              totpSecret = parsed.totpSecret;
              is2FAEnabled = parsed.is2FAEnabled !== false;
            }
          } catch (e) {}
        }

        if (is2FAEnabled && totpSecret) {
          const totpInput = String(credentials.totpCode || "").trim();
          if (!totpInput) {
            throw new Error("TOTP_REQUIRED: 6-Digit Authenticator code required.");
          }

          const isTotpValid = verifyTOTP(totpSecret, totpInput);
          if (!isTotpValid) {
            await sendSecurityAlert({
              type: "FAILED_2FA_ATTEMPT",
              details: `Invalid 6-digit TOTP code entered during login for: ${emailTrimmed} (IP: ${ip})`,
              ip,
            });
            throw new Error("INVALID_TOTP: Invalid 6-Digit Authenticator code.");
          }
        }

        // 5. Successful login notification
        await sendSecurityAlert({
          type: "SUCCESSFUL_ADMIN_LOGIN",
          details: `Admin user successfully authenticated with Password${is2FAEnabled ? " + TOTP 2FA" : ""}: ${emailTrimmed} (IP: ${ip})`,
          ip,
        });

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.uid;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
