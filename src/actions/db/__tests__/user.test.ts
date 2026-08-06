import { getServerSession } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getFullUser, getUser } from "@/actions/db/user";
import prisma from "@/lib/prisma-client";

import { fakeUserComplete } from "../../../../prisma/utils/fake-data";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma-client", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

const mockGetServerSession = vi.mocked(getServerSession);
const mockFindUnique = vi.mocked(prisma.user.findUnique);

describe("getUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const user = await getUser();

    expect(user).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("should return the user for a valid session", async () => {
    const mockUser = fakeUserComplete();
    const mockSession = {
      user: { id: mockUser.id, email: mockUser.email },
      expires: new Date().toISOString(),
    };

    mockGetServerSession.mockResolvedValue(mockSession);
    mockFindUnique.mockResolvedValue(mockUser);

    const user = await getUser();

    expect(user).toEqual(mockUser);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    });
  });
});

describe("getFullUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when getUser returns null", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const fullUser = await getFullUser();

    expect(fullUser).toBeNull();
  });

  it("should return full user", async () => {
    const mockUser = fakeUserComplete();
    const mockSession = {
      user: { id: mockUser.id, email: mockUser.email },
      expires: new Date().toISOString(),
    };
    const mockFullUser = { ...mockUser };

    mockGetServerSession.mockResolvedValue(mockSession);
    mockFindUnique.mockResolvedValue(mockUser);

    const fullUser = await getFullUser();

    expect(fullUser).toEqual(mockFullUser);
  });
});
