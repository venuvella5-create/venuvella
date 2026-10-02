import { cookies } from "next/headers";

import {
  getAdminCookieName,
  verifyAdminToken,
} from "@/lib/auth/admin-token";

export async function requireAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("Admin authentication is not configured.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  const session = await verifyAdminToken(token, secret);

  if (!session) {
    throw new Error("Unauthorized admin action.");
  }

  return session;
}
