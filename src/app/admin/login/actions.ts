"use server";

import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  UserRole,
} from "@prisma/client";

import {
  createAdminToken,
  getAdminCookieName,
  getAdminSessionDurationSeconds,
} from "@/lib/auth/admin-token";

import {
  verifyPassword,
} from "@/lib/auth/password";

import {
  prisma,
} from "@/lib/db/prisma";


export type AdminLoginState = {
  ok: boolean;
  message: string;
};


function safeCompare(
  first: string,
  second: string
) {
  if (
    first.length !==
    second.length
  ) {
    return false;
  }


  let result = 0;


  for (
    let index = 0;
    index < first.length;
    index += 1
  ) {
    result |=
      first.charCodeAt(
        index
      ) ^
      second.charCodeAt(
        index
      );
  }


  return result === 0;
}


function sanitizeNextPath(
  value:
    | FormDataEntryValue
    | null
) {
  if (
    typeof value !==
    "string"
  ) {
    return "/admin";
  }


  const trimmed =
    value.trim();


  if (
    !trimmed.startsWith(
      "/admin"
    ) ||
    trimmed.startsWith(
      "//"
    ) ||
    trimmed.startsWith(
      "/admin/login"
    )
  ) {
    return "/admin";
  }


  return trimmed;
}


export async function loginAdminAction(
  _previous:
    AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {

  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET;


  if (!sessionSecret) {
    console.error(
      "ADMIN_SESSION_SECRET is not configured."
    );


    return {
      ok: false,

      message:
        "Admin login is not configured.",
    };
  }


  const email =
    String(
      formData.get(
        "email"
      ) ?? ""
    )
      .trim()
      .toLowerCase();


  const password =
    String(
      formData.get(
        "password"
      ) ?? ""
    );


  if (
    !email ||
    !password
  ) {
    return {
      ok: false,

      message:
        "Email and password are required.",
    };
  }


  /*
   * First attempt normal database-backed
   * staff authentication.
   */

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });


  if (
    existingUser &&
    existingUser.isActive &&
    existingUser.passwordHash
  ) {
    const passwordMatches =
      await verifyPassword(
        password,
        existingUser.passwordHash
      );


    if (passwordMatches) {

      await prisma.user.update({
        where: {
          id:
            existingUser.id,
        },

        data: {
          lastLoginAt:
            new Date(),
        },
      });


      const token =
        await createAdminToken(
          {
            userId:
              existingUser.id,

            email:
              existingUser.email,

            role:
              existingUser.role,
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


      const nextPath =
        sanitizeNextPath(
          formData.get(
            "next"
          )
        );


      redirect(
        nextPath
      );
    }
  }


  /*
   * Bootstrap / emergency administrator.
   *
   * The existing ADMIN_EMAIL and
   * ADMIN_PASSWORD environment credentials
   * remain supported so the current master
   * administrator is not locked out.
   *
   * Additional staff accounts authenticate
   * using their database passwordHash.
   */

  const configuredEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();


  const configuredPassword =
    process.env.ADMIN_PASSWORD;


  const masterEmailMatches =
    configuredEmail
      ? safeCompare(
          email,
          configuredEmail
        )
      : false;


  const masterPasswordMatches =
    configuredPassword
      ? safeCompare(
          password,
          configuredPassword
        )
      : false;


  if (
    !masterEmailMatches ||
    !masterPasswordMatches
  ) {
    return {
      ok: false,

      message:
        "Invalid email or password.",
    };
  }


  /*
   * Ensure the environment-based master
   * administrator exists in the database.
   *
   * It always retains ADMIN access and can
   * recover access even before staff account
   * management has been configured.
   */

  const masterUser =
    await prisma.user.upsert({
      where: {
        email,
      },

      update: {
        role:
          UserRole.ADMIN,

        isActive:
          true,

        lastLoginAt:
          new Date(),
      },

      create: {
        email,

        name:
          "Venuvella Admin",

        role:
          UserRole.ADMIN,

        isActive:
          true,

        lastLoginAt:
          new Date(),
      },

      select: {
        id: true,
        email: true,
        role: true,
      },
    });


  const token =
    await createAdminToken(
      {
        userId:
          masterUser.id,

        email:
          masterUser.email,

        role:
          masterUser.role,
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


  const nextPath =
    sanitizeNextPath(
      formData.get(
        "next"
      )
    );


  redirect(
    nextPath
  );
}


export async function logoutAdminAction() {

  const cookieStore =
    await cookies();


  cookieStore.set(
    getAdminCookieName(),
    "",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      expires:
        new Date(0),
    }
  );


  redirect(
    "/admin/login"
  );
}