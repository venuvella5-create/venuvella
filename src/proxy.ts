import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAdminCookieName,
  verifyAdminToken,
} from "@/lib/auth/admin-token";


export default async function proxy(
  request: NextRequest
) {
  const {
    pathname,
    search,
  } = request.nextUrl;


  /*
   * Allow login page.
   */

  if (
    pathname ===
    "/admin/login"
  ) {
    return NextResponse.next();
  }


  /*
   * Only protect /admin routes.
   */

  if (
    !pathname.startsWith(
      "/admin"
    )
  ) {
    return NextResponse.next();
  }


  const secret =
    process.env.ADMIN_SESSION_SECRET;


  if (!secret) {
    console.error(
      "ADMIN_SESSION_SECRET is missing."
    );


    const loginUrl =
      new URL(
        "/admin/login",
        request.url
      );


    return NextResponse.redirect(
      loginUrl
    );
  }


  const token =
    request.cookies.get(
      getAdminCookieName()
    )?.value;


  const session =
    await verifyAdminToken(
      token,
      secret
    );


  if (!session) {
    const loginUrl =
      new URL(
        "/admin/login",
        request.url
      );


    const nextPath =
      `${pathname}${search}`;


    loginUrl.searchParams.set(
      "next",
      nextPath
    );


    return NextResponse.redirect(
      loginUrl
    );
  }


  return NextResponse.next();
}


export const config = {
  matcher: [
    "/admin/:path*",
  ],
};