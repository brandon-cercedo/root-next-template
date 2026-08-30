import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteFlagOverrides,
  updateFlagOverrides,
} from "@/actions/flags";
import {
  FLAG_OVERRIDE_COOKIE_NAME,
  FLAG_OVERRIDE_COOKIE_PATH,
} from "@/lib/flags/config";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

const mockGetUser = vi.fn();
const mockIsAdmin = vi.fn();
const mockEncryptOverrides = vi.fn();
const mockCookieSet = vi.fn();
const mockCookieDelete = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("@/actions/db/user", () => ({
  getUser: () => mockGetUser(),
}));

vi.mock("@/lib/utils/db/user", () => ({
  isAdmin: (user: { email: string }) => mockIsAdmin(user),
}));

vi.mock("flags", () => ({
  encryptOverrides: (overrides: unknown) => mockEncryptOverrides(overrides),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/config/envs", () => ({
  isProduction: () => false,
  isPreview: () => false,
}));

describe("updateFlagOverrides", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEncryptOverrides.mockResolvedValue("encrypted-payload");
    vi.mocked(cookies).mockResolvedValue({
      get: mockCookieGet,
      set: mockCookieSet,
      delete: mockCookieDelete,
    } as never);
  });

  it("should no-op when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    await updateFlagOverrides({ "client-debug": true });

    expect(mockEncryptOverrides).not.toHaveBeenCalled();
    expect(mockCookieSet).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should no-op when the user is not an admin", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockIsAdmin.mockReturnValue(false);

    await updateFlagOverrides({ "client-debug": true });

    expect(mockEncryptOverrides).not.toHaveBeenCalled();
    expect(mockCookieSet).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should no-op when sanitization removes every key", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockIsAdmin.mockReturnValue(true);

    await updateFlagOverrides({} as never);

    expect(mockEncryptOverrides).not.toHaveBeenCalled();
    expect(mockCookieSet).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should encrypt, set the cookie, and revalidate for admins", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockIsAdmin.mockReturnValue(true);

    await updateFlagOverrides({
      "client-debug": true,
      "server-debug": false,
    });

    expect(mockEncryptOverrides).toHaveBeenCalledWith({
      "client-debug": true,
      "server-debug": false,
    });
    expect(mockCookieSet).toHaveBeenCalledWith(
      FLAG_OVERRIDE_COOKIE_NAME,
      "encrypted-payload",
      {
        httpOnly: true,
        path: FLAG_OVERRIDE_COOKIE_PATH,
        sameSite: "lax",
        secure: false,
      }
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});

describe("deleteFlagOverrides", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue({
      get: mockCookieGet,
      set: mockCookieSet,
      delete: mockCookieDelete,
    } as never);
  });

  it("should no-op when the user is not authenticated", async () => {
    mockGetUser.mockResolvedValue(null);

    await deleteFlagOverrides();

    expect(mockCookieDelete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should no-op when the user is not an admin", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockIsAdmin.mockReturnValue(false);

    await deleteFlagOverrides();

    expect(mockCookieDelete).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("should delete the cookie and revalidate for admins", async () => {
    const user = fakeUserComplete();
    mockGetUser.mockResolvedValue(user);
    mockIsAdmin.mockReturnValue(true);

    await deleteFlagOverrides();

    expect(mockCookieDelete).toHaveBeenCalledWith({
      name: FLAG_OVERRIDE_COOKIE_NAME,
      path: FLAG_OVERRIDE_COOKIE_PATH,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
