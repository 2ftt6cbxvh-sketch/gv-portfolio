import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendSecurityAlert } from "./securityAlerts";

export const authOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const emailTrimmed = credentials.email.toLowerCase().trim();
        const user = await prisma.adminUser.findUnique({
          where: { email: emailTrimmed },
        });

        if (!user) {
          // Alert on Wrong Admin Email Attempt
          await sendSecurityAlert({
            type: "FAILED_PASSWORD_ATTEMPT",
            details: `Failed login attempt for unknown email: ${emailTrimmed}`,
          });
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          // Alert on Wrong Admin Password Attempt
          await sendSecurityAlert({
            type: "FAILED_PASSWORD_ATTEMPT",
            details: `Invalid password entered for admin: ${emailTrimmed}`,
          });
          return null;
        }

        // Log Successful Admin Login
        await sendSecurityAlert({
          type: "SUCCESSFUL_ADMIN_LOGIN",
          details: `Admin user successfully authenticated: ${emailTrimmed}`,
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
