import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma-client";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

import type { CredentialsConfig } from "next-auth/providers/credentials";

vi.mock("@/lib/config/envs", () => ({
  envs: {
    GOOGLE_CLIENT_ID: "test-google-client-id",
    GOOGLE_CLIENT_SECRET: "test-google-client-secret",
  },
}));

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

describe("authOptions", () => {
  describe("providers", () => {
    describe("CredentialsProvider", () => {
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
  });
});
