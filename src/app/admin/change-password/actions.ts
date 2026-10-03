"use server";

import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  createAdminToken,
  getAdminCookieName,
  getAdminSessionDurationSeconds,
} from "@/lib/auth/admin-token";

import {
  requireAdminSession,
} from "@/lib/auth/require-admin";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

import {
  prisma,
} from "@/lib/db/prisma";


const MIN_PASSWORD_LENGTH =
  12;


function redirectWithError(
  error: string
): never {
  redirect(
    `/admin/change-password?error=${encodeURIComponent(
      error
    )}`
  );
}


export async function changeRequiredPasswordAction(
  formData: FormData
) {
  const session =
    await requireAdminSession();


  if (
    !session.mustChangePassword
  ) {
    redirect(
      "/admin"
    );
  }


  const newPassword =
    String(
      formData.get(
        "newPassword"
      ) ?? ""
    );


  const confirmPassword =
    String(
      formData.get(
        "confirmPassword"
      ) ?? ""
    );


  if (
    !newPassword ||
    !confirmPassword
  ) {
    redirectWithError(
      "required"
    );
  }


  if (
    newPassword.length <
    MIN_PASSWORD_LENGTH
  ) {
    redirectWithError(
      "length"
    );
  }


  if (
    newPassword !==
    confirmPassword
  ) {
    redirectWithError(
      "mismatch"
    );
  }


  const currentUser =
    await prisma.user.findUnique({
      where: {
        id:
          session.userId,
      },

      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        isActive: true,
        mustChangePassword: true,
      },
    });


  if (
    !currentUser ||
    !currentUser.isActive
  ) {
    redirect(
      "/admin/login"
    );
  }


  if (
    !currentUser.mustChangePassword
  ) {
    redirect(
      "/admin"
    );
  }


  if (
    currentUser.passwordHash
  ) {
    const isSamePassword =
      await verifyPassword(
        newPassword,
        currentUser.passwordHash
      );


    if (isSamePassword) {
      redirectWithError(
        "same"
      );
    }
  }


  const passwordHash =
    await hashPassword(
      newPassword
    );


  const updatedUser =
    await prisma.$transaction(
      async (
        transaction
      ) => {
        const user =
          await transaction.user.update({
            where: {
              id:
                currentUser.id,
            },

            data: {
              passwordHash,

              mustChangePassword:
                false,

              passwordChangedAt:
                new Date(),

              sessionVersion: {
                increment: 1,
              },
            },

            select: {
              id: true,
              email: true,
              role: true,
              sessionVersion: true,
            },
          });


        await transaction.auditLog.create({
          data: {
            userId:
              user.id,

            action:
              "ADMIN_PASSWORD_CHANGED",

            entity:
              "USER",

            entityId:
              user.id,

            metadata: {
              forcedChange:
                true,
            },
          },
        });


        return user;
      }
    );


  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET;


  if (!sessionSecret) {
    throw new Error(
      "Admin authentication is not configured."
    );
  }


  const token =
    await createAdminToken(
      {
        userId:
          updatedUser.id,

        email:
          updatedUser.email,

        role:
          updatedUser.role,

        sessionVersion:
          updatedUser.sessionVersion,
      },

      sessionSecret
    );


  const cookieStore =
    await cookies();


  cookieStore.set(
    getAdminCookieName(),
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        getAdminSessionDurationSeconds(),
    }
  );


  redirect(
    "/admin"
  );
}