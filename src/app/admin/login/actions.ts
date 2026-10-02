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
    index <
    first.length;
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

  const configuredEmail =
    process.env.ADMIN_EMAIL;


  const configuredPassword =
    process.env.ADMIN_PASSWORD;


  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET;


  if (
    !configuredEmail ||
    !configuredPassword ||
    !sessionSecret
  ) {
    console.error(
      "Admin authentication environment variables are not configured."
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


  const emailMatches =
    safeCompare(
      email,
      configuredEmail
        .trim()
        .toLowerCase()
    );


  const passwordMatches =
    safeCompare(
      password,
      configuredPassword
    );


  if (
    !emailMatches ||
    !passwordMatches
  ) {
    return {
      ok: false,

      message:
        "Invalid email or password.",
    };
  }


  const token =
    await createAdminToken(
      email,
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