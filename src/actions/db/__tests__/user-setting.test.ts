import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { completeLoginConfetti } from "@/actions/db/user-setting";
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
