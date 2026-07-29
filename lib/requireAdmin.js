import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Use in every admin API route to reject unauthenticated requests.
// Returns the session if valid, or null (caller responds 401).
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}
