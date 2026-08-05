import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

import { authOptions } from "./lib/auth";

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
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
