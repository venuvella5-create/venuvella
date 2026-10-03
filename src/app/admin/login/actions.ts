"use server";

import {
  createHmac,
} from "node:crypto";

import {
  cookies,
  headers,
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


const LOGIN_WINDOW_MINUTES =
  15;

const MAX_EMAIL_FAILURES =
  5;

const MAX_IP_FAILURES =
  20;


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


function createRateLimitKey(
  value: string,
  secret: string
) {
  return createHmac(
    "sha256",
    secret
  )
    .update(
      value
    )
    .digest(
      "hex"
    );
}


async function getClientIp() {
  const requestHeaders =
    await headers();


  const forwardedFor =
    requestHeaders.get(
      "x-forwarded-for"
    );


  if (forwardedFor) {
    const firstAddress =
      forwardedFor
        .split(",")[0]
        ?.trim();


    if (firstAddress) {
      return firstAddress;
    }
  }


  const realIp =
    requestHeaders.get(
      "x-real-ip"
    );


  if (realIp) {
    return realIp.trim();
  }


  const connectingIp =
    requestHeaders.get(
      "cf-connecting-ip"
    );


  if (connectingIp) {
    return connectingIp.trim();
  }


  return "unknown";
}


async function isLoginRateLimited(
  emailKey: string,
  ipKey: string
) {
  const windowStart =
    new Date(
      Date.now() -
        LOGIN_WINDOW_MINUTES *
          60 *
          1000
    );


  const [
    emailFailures,
    ipFailures,
  ] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action:
          "ADMIN_LOGIN_FAILED",

        entity:
          "AUTH_EMAIL",

        entityId:
          emailKey,

        createdAt: {
          gte:
            windowStart,
        },
      },
    }),

    prisma.auditLog.count({
      where: {
        action:
          "ADMIN_LOGIN_FAILED",

        entity:
          "AUTH_IP",

        entityId:
          ipKey,

        createdAt: {
          gte:
            windowStart,
        },
      },
    }),
  ]);


  return (
    emailFailures >=
      MAX_EMAIL_FAILURES ||
    ipFailures >=
      MAX_IP_FAILURES
  );
}


async function recordFailedLogin(
  emailKey: string,
  ipKey: string
) {
  await prisma.auditLog.createMany({
    data: [
      {
        action:
          "ADMIN_LOGIN_FAILED",

        entity:
          "AUTH_EMAIL",

        entityId:
          emailKey,
      },

      {
        action:
          "ADMIN_LOGIN_FAILED",

        entity:
          "AUTH_IP",

        entityId:
          ipKey,
      },
    ],
  });
}


async function recordSuccessfulLogin(
  userId: string
) {
  await prisma.auditLog.create({
    data: {
      userId,

      action:
        "ADMIN_LOGIN_SUCCESS",

      entity:
        "AUTH",

      entityId:
        userId,
    },
  });
}


async function establishSession({
  userId,
  email,
  role,
  sessionVersion,
  sessionSecret,
  nextPath,
  mustChangePassword,
}: {
  userId: string;
  email: string;

  role:
    | "ADMIN"
    | "EDITOR"
    | "AUTHOR"
    | "ANALYST";

  sessionVersion: number;
  sessionSecret: string;
  nextPath: string;
  mustChangePassword: boolean;
}) {
  const token =
    await createAdminToken(
      {
        userId,
        email,
        role,
        sessionVersion,
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


  if (mustChangePassword) {
    redirect(
      "/admin/change-password"
    );
  }


  redirect(
    nextPath
  );
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


  const clientIp =
    await getClientIp();


  const emailKey =
    createRateLimitKey(
      `email:${email}`,
      sessionSecret
    );


  const ipKey =
    createRateLimitKey(
      `ip:${clientIp}`,
      sessionSecret
    );


  const rateLimited =
    await isLoginRateLimited(
      emailKey,
      ipKey
    );


  if (rateLimited) {
    return {
      ok: false,

      message:
        "Too many login attempts. Please try again later.",
    };
  }


  const nextPath =
    sanitizeNextPath(
      formData.get(
        "next"
      )
    );


  /*
   * Database-backed staff authentication.
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
        sessionVersion: true,
        mustChangePassword: true,
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


      await recordSuccessfulLogin(
        existingUser.id
      );


      await establishSession({
        userId:
          existingUser.id,

        email:
          existingUser.email,

        role:
          existingUser.role,

        sessionVersion:
          existingUser.sessionVersion,

        sessionSecret,

        nextPath,

        mustChangePassword:
          existingUser.mustChangePassword,
      });
    }
  }


  /*
   * Bootstrap / emergency master administrator.
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
    await recordFailedLogin(
      emailKey,
      ipKey
    );


    return {
      ok: false,

      message:
        "Invalid email or password.",
    };
  }


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

        mustChangePassword:
          false,

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

        mustChangePassword:
          false,

        lastLoginAt:
          new Date(),
      },

      select: {
        id: true,
        email: true,
        role: true,
        sessionVersion: true,
      },
    });


  await recordSuccessfulLogin(
    masterUser.id
  );


  await establishSession({
    userId:
      masterUser.id,

    email:
      masterUser.email,

    role:
      masterUser.role,

    sessionVersion:
      masterUser.sessionVersion,

    sessionSecret,

    nextPath,

    mustChangePassword:
      false,
  });


  return {
    ok: true,
    message: "",
  };
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