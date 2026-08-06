import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { paths } from "@/lib/config/paths";

const withAuthMock = vi.fn(
  (
    middleware: (request: unknown) => NextResponse,
    options: {
      callbacks: {
        authorized: (params: { token: unknown }) => boolean;
      };
      pages: unknown;
    }
  ) => {
    return Object.assign(middleware, { options });
  }
);

vi.mock("next-auth/middleware", () => ({
  withAuth: (
    middleware: (request: unknown) => NextResponse,
    options: {
      callbacks: {
        authorized: (params: { token: unknown }) => boolean;
      };
      pages: unknown;
    }
  ) => withAuthMock(middleware, options),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {
    pages: {
      signIn: paths.auth.signIn(),
      signOut: paths.auth.signOut(),
      error: paths.auth.error("FailedToSignIn"),
    },
  },
}));

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should protect dashboard routes and reuse auth pages", async () => {
    const { default: proxy, config } = await import("@/proxy");

    expect(config).toEqual({
      matcher: ["/dashboard/:path*"],
    });
    expect(withAuthMock).toHaveBeenCalledOnce();

    const [_, options] = withAuthMock.mock.calls[0]!;
    expect(options.pages).toEqual({
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      error: "/error?error=FailedToSignIn",
    });
    expect(typeof proxy).toBe("function");
  });

  it("should authorize only when a token is present", async () => {
    await import("@/proxy");

    const [_, options] = withAuthMock.mock.calls[0]!;
    const { authorized } = options.callbacks;

    expect(authorized({ token: { sub: "user-1" } })).toBe(true);
    expect(authorized({ token: null })).toBe(false);
    expect(authorized({ token: undefined })).toBe(false);
  });

  it("should continue the request when authorized", async () => {
    const nextSpy = vi.spyOn(NextResponse, "next");
    await import("@/proxy");

    const [middleware] = withAuthMock.mock.calls[0]!;
    const response = middleware({});

    expect(nextSpy).toHaveBeenCalledOnce();
    expect(response).toBeInstanceOf(NextResponse);
    nextSpy.mockRestore();
  });
});
