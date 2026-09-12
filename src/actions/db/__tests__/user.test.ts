import { getServerSession } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getFullUser, getUser } from "@/actions/db/user";
import prisma from "@/lib/prisma-client";
import {
  fakeUserComplete,
  fakeUserSettingComplete,
} from "@/prisma/utils/fake-data";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma-client", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    userSetting: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

const mockGetServerSession = vi.mocked(getServerSession);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockFindSetting = vi.mocked(prisma.userSetting.findUnique);

function mockSessionFor(user: { id: string; email: string }) {
  return {
    user: { id: user.id, email: user.email },
    expires: new Date().toISOString(),
  };
}

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

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
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

  it("should return null when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const fullUser = await getFullUser();

    expect(fullUser).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockFindSetting).not.toHaveBeenCalled();
  });

  it("should return the user with setting and a cleared password", async () => {
    const mockUser = fakeUserComplete();
    const mockSetting = {
      ...fakeUserSettingComplete(),
      userId: mockUser.id,
    };

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindUnique.mockResolvedValue(mockUser);
    mockFindSetting.mockResolvedValue(mockSetting);

    const fullUser = await getFullUser();

    expect(fullUser).toEqual({
      ...mockUser,
      password: null,
      setting: mockSetting,
    });
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    });
    expect(mockFindSetting).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
    });
  });

  it("should return a null setting when the relation is missing", async () => {
    const mockUser = fakeUserComplete();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindUnique.mockResolvedValue(mockUser);
    mockFindSetting.mockResolvedValue(null);

    const fullUser = await getFullUser();

    expect(fullUser).toEqual({
      ...mockUser,
      password: null,
      setting: null,
    });
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
