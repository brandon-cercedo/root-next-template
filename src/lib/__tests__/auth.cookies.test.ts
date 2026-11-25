// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const envMocks = vi.hoisted(() => ({
  envs: { PORT: 3002 as number | undefined },
  isDevelopment: vi.fn(() => true),
}));

vi.mock("@/lib/config/envs", () => envMocks);

async function importAuthCookies() {
  const { authCookies } = await import("@/lib/auth/cookies");
  return authCookies;
}

describe("authCookies", () => {
  beforeEach(() => {
    vi.resetModules();
    envMocks.envs.PORT = 3002;
    envMocks.isDevelopment.mockReturnValue(true);
  });

  it("should prefix cookie names with the port in development", async () => {
    const authCookies = await importAuthCookies();

    expect(authCookies?.sessionToken?.name).toBe(
      "next-auth.3002.session-token"
    );
    expect(authCookies?.csrfToken?.name).toBe("next-auth.3002.csrf-token");
    expect(authCookies?.callbackUrl?.name).toBe("next-auth.3002.callback-url");
  });

  it("should keep the NextAuth defaults for cookie options", async () => {
    const authCookies = await importAuthCookies();

    expect(authCookies?.sessionToken?.options).toEqual({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
    });
  });

  it("should use the default cookies outside development", async () => {
    envMocks.isDevelopment.mockReturnValue(false);

    await expect(importAuthCookies()).resolves.toBeUndefined();
  });
});
