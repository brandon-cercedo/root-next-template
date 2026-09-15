import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma-client", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("getCurrentUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should query Prisma with the given userId", async () => {
    const prisma = (await import("@/lib/prisma-client")).default;
    const mockFindUnique = vi.mocked(prisma.user.findUnique);

    const profile = {
      name: "Ada",
      email: "ada@example.com",
      image: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
      accounts: [{ type: "oauth", provider: "google" }],
    };
    mockFindUnique.mockResolvedValue(profile as never);

    const { getCurrentUserProfile } =
      await import("@/features/chat/services/user");
    const result = await getCurrentUserProfile("session-user-1");

    expect(mockFindUnique).toHaveBeenCalledExactlyOnceWith({
      where: { id: "session-user-1" },
      select: {
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            type: true,
            provider: true,
          },
        },
      },
    });
    expect(result).toEqual(profile);
  });
});
