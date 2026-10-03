import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAdminSession();

    return NextResponse.json(
      {
        authenticated: true,
        userId: session.userId,
        email: session.email,
        role: session.role,
        sessionVersion: session.sessionVersion,
        mustChangePassword: session.mustChangePassword,
        passwordChangedAt: session.passwordChangedAt,
        exp: session.exp,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  }
}
