import { envs, isDevelopment } from "@/lib/config/envs";

import type { CookieOption, CookiesOptions } from "next-auth";

/**
 * Same options as the NextAuth defaults over plain http.
 */
const COOKIE_OPTIONS: CookieOption["options"] = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: false,
};

function createCookie(name: string, prefix: number): CookieOption {
  return { name: `next-auth.${prefix}.${name}`, options: COOKIE_OPTIONS };
}

/**
 * @note `prefix`:
 * - Keeps sessions apart given that localhost ports share cookies.
 * - Keep in mind that NextAuth reads every cookie starting with the session
 *   cookie name as a chunk of the same token.
 */
function getAuthCookies(): Partial<CookiesOptions> | undefined {
  const prefix = envs.PORT;
  if (!isDevelopment() || !prefix) {
    return undefined;
  }

  return {
    sessionToken: createCookie("session-token", prefix),
    csrfToken: createCookie("csrf-token", prefix),
    callbackUrl: createCookie("callback-url", prefix),
  };
}

export const authCookies = getAuthCookies();
