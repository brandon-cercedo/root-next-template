import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authOptions } from "@/lib/auth";
import { DEVELOPMENT_PROVIDER_ID } from "@/lib/auth/constants";
import prisma from "@/lib/prisma-client";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

import type { CredentialsConfig } from "next-auth/providers/credentials";

const envMocks = vi.hoisted(() => ({
  envs: {
    GOOGLE_CLIENT_ID: "test-google-client-id",
    GOOGLE_CLIENT_SECRET: "test-google-client-secret",
    SEED_USER_EMAIL: "john.doe@example.com" as string | undefined,
  },
  isDevelopment: vi.fn(() => false),
}));

vi.mock("@/lib/config/envs", () => envMocks);

vi.mock("@next-auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("@/lib/prisma-client", () => ({
  default: {
    user: { findUnique: vi.fn() },
    account: { create: vi.fn() },
  },
}));

function getCredentialsProvider() {
  return authOptions.providers.find((item) => item.id === "credentials") as
    | CredentialsConfig
    | undefined;
}

// authOptions is built at import time, so re-import it per env setup.
async function importDevelopmentProvider() {
  const { authOptions } = await import("@/lib/auth");
  const { default: prisma } = await import("@/lib/prisma-client");
  // The custom id lives in `options` until NextAuth parses the providers.
  const provider = authOptions.providers.find(
    (item) =>
      (item as CredentialsConfig).options?.id === DEVELOPMENT_PROVIDER_ID
  ) as CredentialsConfig | undefined;

  return {
    authorize: provider?.options?.authorize ?? provider?.authorize,
    mockFindUnique: vi.mocked(prisma.user.findUnique),
    provider,
  };
}

describe("authOptions", () => {
  describe("providers", () => {
    describe(`CredentialsProvider["credentials"]`, () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      const mockFindUnique = vi.mocked(prisma.user.findUnique);
      const mockUser = fakeUserComplete();
      const provider = getCredentialsProvider();
      const authorize = provider?.options?.authorize ?? provider?.authorize;

      it("should define authorize", () => {
        expect(authorize).toBeTypeOf("function");
      });

      it("should return null for invalid credentials payload", async () => {
        await expect(
          authorize({ email: "bad", password: "short" })
        ).resolves.toBeNull();
        expect(mockFindUnique).not.toHaveBeenCalled();
      });

      it("should return null when the user does not exist", async () => {
        mockFindUnique.mockResolvedValue(null);

        await expect(
          authorize({
            email: "sarah@example.com",
            password: "password123",
          })
        ).resolves.toBeNull();
      });

      it("should return null when user has no password", async () => {
        mockFindUnique.mockResolvedValue({
          ...mockUser,
          email: "john@example.com",
          password: null,
        });

        await expect(
          authorize({
            email: "john@example.com",
            password: "password123",
          })
        ).resolves.toBeNull();
      });

      it("should return null when the password does not match", async () => {
        const hashedPassword = await bcrypt.hash("password123", 10);
        mockFindUnique.mockResolvedValue({
          ...mockUser,
          email: "john@example.com",
          password: hashedPassword,
        });

        await expect(
          authorize({
            email: "john@example.com",
            password: "wrong-password",
          })
        ).resolves.toBeNull();
      });

      it("should return the user when credentials are valid", async () => {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = {
          ...fakeUserComplete(),
          email: "john@example.com",
          password: hashedPassword,
        };
        mockFindUnique.mockResolvedValue(user);

        await expect(
          authorize({
            email: "john@example.com",
            password: "password123",
          })
        ).resolves.toEqual(user);
      });
    });

    describe(`CredentialsProvider["development"]`, () => {
      beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        envMocks.envs.SEED_USER_EMAIL = "john.doe@example.com";
        envMocks.isDevelopment.mockReturnValue(true);
      });

      it("should not be registered outside development", async () => {
        envMocks.isDevelopment.mockReturnValue(false);

        const { provider } = await importDevelopmentProvider();

        expect(provider).toBeUndefined();
      });

      it("should sign in as the seed user", async () => {
        const user = fakeUserComplete();
        const { authorize, mockFindUnique } =
          await importDevelopmentProvider();
        mockFindUnique.mockResolvedValue(user);

        await expect(authorize({}, {} as never)).resolves.toEqual(user);
        expect(mockFindUnique).toHaveBeenCalledWith({
          where: { email: "john.doe@example.com" },
        });
      });

      it("should return null when the seed user does not exist", async () => {
        const { authorize, mockFindUnique } =
          await importDevelopmentProvider();
        mockFindUnique.mockResolvedValue(null);

        await expect(authorize({}, {} as never)).resolves.toBeNull();
      });

      it("should return null when SEED_USER_EMAIL is not set", async () => {
        envMocks.envs.SEED_USER_EMAIL = undefined;
        const { authorize, mockFindUnique } =
          await importDevelopmentProvider();

        await expect(authorize({}, {} as never)).resolves.toBeNull();
        expect(mockFindUnique).not.toHaveBeenCalled();
      });
    });
  });
});
