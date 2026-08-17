import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  completeLoginConfetti,
  getFullUser,
  getUser,
} from "@/actions/db/user";
import { paths } from "@/lib/config/paths";
import prisma from "@/lib/prisma-client";
import {
  fakeUserComplete,
  fakeUserSettingComplete,
} from "@/prisma/utils/fake-data";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
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
const mockRevalidatePath = vi.mocked(revalidatePath);
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

describe("completeLoginConfetti", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should no-op when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);

    await completeLoginConfetti();

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockFindSetting).not.toHaveBeenCalled();
    expect(mockUpdateSetting).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("should throw when UserSetting is missing", async () => {
    const mockUser = fakeUserComplete();

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindUnique.mockResolvedValue(mockUser);
    mockFindSetting.mockResolvedValue(null);

    await expect(completeLoginConfetti()).rejects.toThrow(
      "[completeLoginConfetti] Missing UserSetting"
    );
    expect(mockUpdateSetting).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("should not overwrite an existing loginConfettiSeenAt", async () => {
    const mockUser = fakeUserComplete();
    const seenAt = "2026-08-16T12:00:00.000Z";

    mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
    mockFindUnique.mockResolvedValue(mockUser);
    mockFindSetting.mockResolvedValue({
      ...fakeUserSettingComplete(),
      userId: mockUser.id,
      preferences: { loginConfettiSeenAt: seenAt },
    });

    await completeLoginConfetti();

    expect(mockUpdateSetting).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("should set loginConfettiSeenAt when it is unset", async () => {
    const mockUser = fakeUserComplete();
    const now = new Date("2026-08-17T18:30:00.000Z");

    vi.useFakeTimers();
    vi.setSystemTime(now);

    try {
      mockGetServerSession.mockResolvedValue(mockSessionFor(mockUser));
      mockFindUnique.mockResolvedValue(mockUser);
      mockFindSetting.mockResolvedValue({
        ...fakeUserSettingComplete(),
        userId: mockUser.id,
        preferences: {},
      });

      await completeLoginConfetti();

      expect(mockUpdateSetting).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        data: {
          preferences: {
            loginConfettiSeenAt: now.toISOString(),
          },
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(paths.dashboard.home());
    } finally {
      vi.useRealTimers();
    }
  });
});
