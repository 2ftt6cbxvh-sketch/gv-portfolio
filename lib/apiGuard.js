import { NextResponse } from "next/server";
import { requireAdminSession } from "./requireAdmin";

// Wrap any admin API route handler; rejects with 401 if not authenticated.
// Must NOT be `async` itself — it needs to return the handler function
// synchronously so `export const GET = withAdmin(fn)` assigns a callable,
// not a Promise (Next.js calls the export directly as a request handler).
export function withAdmin(handler) {
  return async (req, ctx) => {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ctx);
  };
}
