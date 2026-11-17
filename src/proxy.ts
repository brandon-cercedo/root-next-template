import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

import { authOptions } from "./lib/auth";
import { authCookies } from "./lib/auth/cookies";

/**
 * @note `withAuth` augments your `Request` with the user's token.
 * @note The `middleware` function will only be invoked if the `authorized` callback returns `true`.
 */
export default withAuth(
  function middleware(_request) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: authOptions.pages,
    cookies: { sessionToken: authCookies?.sessionToken },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
