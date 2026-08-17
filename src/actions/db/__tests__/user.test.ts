import { getServerSession } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getFullUser,
  getUser,
  markLoginConfettiSeen,
} from "@/actions/db/user";
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
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

const mockGetServerSession = vi.mocked(getServerSession);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockFindSetting = vi.mocked(prisma.userSetting.findUnique);
const mockUpdateSetting = vi.mocked(prisma.userSetting.update);

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
  });

  it("should return the user with setting and a cleared password", async () => {
    const mockUser = fakeUserComplete();
    const mockSetting = {
      ...fakeUserSettingComplete(),
      userId: mockUser.id,
    };

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindUnique.mockResolvedValue({
      ...mockUser,
      setting: mockSetting,
    } as typeof mockUser);

    const fullUser = await getFullUser();

    expect(fullUser).toEqual({
      ...mockUser,
      password: null,
      setting: mockSetting,
    });
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      include: { setting: true },
    });
  });

  it("should return a null setting when the relation is missing", async () => {
    const mockUser = fakeUserComplete();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindUnique.mockResolvedValue({
      ...mockUser,
      setting: null,
    } as typeof mockUser);

    const fullUser = await getFullUser();

    expect(fullUser).toEqual({
      ...mockUser,
      password: null,
      setting: null,
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("markLoginConfettiSeen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should no-op when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    await markLoginConfettiSeen();

    expect(mockFindSetting).not.toHaveBeenCalled();
    expect(mockUpdateSetting).not.toHaveBeenCalled();
  });

  it("should no-op when UserSetting is missing", async () => {
    const mockUser = fakeUserComplete();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindSetting.mockResolvedValue(null);

    await markLoginConfettiSeen();

    expect(mockUpdateSetting).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("should not overwrite an existing loginConfettiSeenAt", async () => {
    const mockUser = fakeUserComplete();
    const seenAt = "2026-08-16T12:00:00.000Z";

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindSetting.mockResolvedValue({
      ...fakeUserSettingComplete(),
      userId: mockUser.id,
      preferences: { loginConfettiSeenAt: seenAt },
    });

    await markLoginConfettiSeen();

    expect(mockUpdateSetting).not.toHaveBeenCalled();
  });

  it("should set loginConfettiSeenAt when it is unset", async () => {
    const mockUser = fakeUserComplete();
    const now = new Date("2026-08-17T18:30:00.000Z");

    vi.useFakeTimers();
    vi.setSystemTime(now);

    try {
      mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
      mockFindSetting.mockResolvedValue({
        ...fakeUserSettingComplete(),
        userId: mockUser.id,
        preferences: {},
      });

      await markLoginConfettiSeen();

      expect(mockUpdateSetting).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        data: {
          preferences: {
            loginConfettiSeenAt: now.toISOString(),
          },
        },
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
