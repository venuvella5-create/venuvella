import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  getAdminCookieName,
  verifyAdminToken,
  type AdminSessionRole,
} from "@/lib/auth/admin-token";

import {
  prisma,
} from "@/lib/db/prisma";


export async function requireAdminSession() {
  const secret =
    process.env.ADMIN_SESSION_SECRET;


  if (!secret) {
    throw new Error(
      "Admin authentication is not configured."
    );
  }


  const cookieStore =
    await cookies();


  const token =
    cookieStore.get(
      getAdminCookieName()
    )?.value;


  const session =
    await verifyAdminToken(
      token,
      secret
    );


  if (!session) {
    throw new Error(
      "Unauthorized admin action."
    );
  }


  const user =
    await prisma.user.findUnique({
      where: {
        id:
          session.userId,
      },

      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });


  if (
    !user ||
    !user.isActive
  ) {
    throw new Error(
      "Unauthorized admin action."
    );
  }


  if (
    user.email !==
    session.email
  ) {
    throw new Error(
      "Unauthorized admin action."
    );
  }


  return {
    userId:
      user.id,

    email:
      user.email,

    role:
      user.role as AdminSessionRole,

    exp:
      session.exp,
  };
}


export async function requireRole(
  allowedRoles:
    readonly AdminSessionRole[]
) {
  const session =
    await requireAdminSession();


  if (
    !allowedRoles.includes(
      session.role
    )
  ) {
    throw new Error(
      "You do not have permission to perform this action."
    );
  }


  return session;
}


export async function requirePageRole(
  allowedRoles:
    readonly AdminSessionRole[]
) {
  let session;


  try {
    session =
      await requireAdminSession();
  } catch {
    redirect(
      "/admin/login"
    );
  }


  if (
    !allowedRoles.includes(
      session.role
    )
  ) {
    redirect(
      "/admin/forbidden"
    );
  }


  return session;
}