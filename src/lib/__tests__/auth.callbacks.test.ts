import { beforeEach, describe, expect, it, vi } from "vitest";

import { authOptions } from "@/lib/auth";
import { paths } from "@/lib/config/paths";
import prisma from "@/lib/prisma-client";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

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

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockAccountCreate = vi.mocked(prisma.account.create);

describe("authOptions", () => {
  describe("callbacks", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    const mockUser = fakeUserComplete();
    const mockGoogleAccount = {
      provider: "google",
      type: "oauth",
      providerAccountId: "google-account-id",
      access_token: "google-access-token",
      expires_at: new Date().getTime() + 1000 * 60 * 60 * 24,
      token_type: "Bearer",
      scope:
        "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      id_token: "google-id-token",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { signIn, jwt, session } = authOptions.callbacks ?? ({} as any);

    it("should define callbacks functions", () => {
      expect(signIn).toBeTypeOf("function");
      expect(jwt).toBeTypeOf("function");
      expect(session).toBeTypeOf("function");
    });

    describe("signIn", () => {
      it("should deny sign-in when email is missing", async () => {
        const user = { ...mockUser, email: undefined };
        const result = await signIn({
          user,
          account: mockGoogleAccount,
        });

        expect(result).toBe(false);
      });

      it("should deny sign-in when account is missing", async () => {
        const result = await signIn({
          user: mockUser,
          account: null,
        });

        expect(result).toBe(false);
      });

      it("should allow non-google providers", async () => {
        const user = {
          ...mockUser,
          id: "user-1",
          email: "john@example.com",
        };
        const result = await signIn({
          user,
          account: {
            providerAccountId: user.id,
            type: "credentials",
            provider: "credentials",
          },
        });

        expect(result).toBe(true);
        expect(mockFindUnique).not.toHaveBeenCalled();
      });

      it("should deny google sign-in for unknown emails", async () => {
        const user = { ...mockUser, email: "sarah@example.com" };
        mockFindUnique.mockResolvedValue(null);

        const result = await signIn({
          user,
          account: mockGoogleAccount,
        });

        expect(result).toBe(paths.auth.error("AccessDenied"));
        expect(mockAccountCreate).not.toHaveBeenCalled();
      });

      it("should link google account when the user has no google account", async () => {
        const user = {
          ...mockUser,
          id: "user-1",
          email: "john@example.com",
        };
        mockFindUnique.mockResolvedValue({
          id: user.id,
          accounts: [],
        } as never);
        mockAccountCreate.mockResolvedValue({} as never);

        const account = mockGoogleAccount;
        const result = await signIn({
          user,
          account,
        });

        expect(result).toBe(true);
        expect(mockAccountCreate).toHaveBeenCalledWith({
          data: {
            userId: user.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        });
      });

      it("should skip linking account when google is already linked", async () => {
        const user = {
          ...mockUser,
          id: "user-1",
          email: "john@example.com",
        };
        mockFindUnique.mockResolvedValue({
          id: user.id,
          accounts: [{ provider: "google" }],
        } as never);

        const result = await signIn({
          user,
          account: mockGoogleAccount,
        });

        expect(result).toBe(true);
        expect(mockAccountCreate).not.toHaveBeenCalled();
      });
    });

    describe("jwt", () => {
      it("should attach user id on jwt with credentials provider", async () => {
        const user = {
          ...mockUser,
          id: "user-1",
          email: "john@example.com",
          name: "John Doe",
        };
        const token = {
          name: user.name,
          email: user.email,
          picture: null,
          sub: user.id,
        };
        const account = {
          providerAccountId: user.id,
          type: "credentials",
          provider: "credentials",
        };

        const result = await jwt({
          token,
          user,
          account,
        });

        expect(result).toMatchObject({
          ...token,
          user: { id: user.id },
          accessToken: undefined,
        });
      });

      it("should attach user id and access token on jwt with google provider", async () => {
        const user = {
          ...mockUser,
          id: "user-1",
          email: "john@example.com",
          name: "John Doe",
        };
        const token = {
          name: user.name,
          email: user.email,
          picture: "https://example.com/picture.jpg",
          sub: user.id,
        };
        const account = mockGoogleAccount;

        const result = await jwt({
          token,
          user,
          account,
        });

        expect(result).toMatchObject({
          ...token,
          user: { id: user.id },
          accessToken: account.access_token,
        });
      });

      it("should leave the jwt unchanged on subsequent calls", async () => {
        const userId = "user-1";
        const token = {
          name: "John Doe",
          email: "john@example.com",
          picture: null,
          sub: userId,
          user: { id: userId },
        };

        const result = await jwt({
          token,
        });

        expect(result).toEqual({ ...token });
      });
    });

    describe("session", () => {
      it("should copy user id and access token onto the session", async () => {
        const user = {
          ...mockUser,
          id: "user-1",
          email: "john@example.com",
          name: "John Doe",
        };
        const sessionData = {
          user: {
            email: "john@example.com",
            name: "John",
            image: null,
          },
          expires: new Date().toISOString(),
        };
        const token = {
          name: user.name,
          email: user.email,
          picture: "https://example.com/picture.jpg",
          sub: user.id,
          user: { id: user.id },
          accessToken: mockGoogleAccount.access_token,
        };

        const result = await session({
          session: sessionData,
          token,
        });

        expect(result.user.id).toBe(user.id);
        expect(result.accessToken).toBe(mockGoogleAccount.access_token);
      });
    });
  });
});
