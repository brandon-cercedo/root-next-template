import { afterEach, describe, expect, it, vi } from "vitest";

import { composeUserDisplayName, isAdmin } from "@/lib/utils/db/user";
import { fakeUserComplete } from "@/prisma/utils/fake-data";

describe("composeUserDisplayName", () => {
  it("should return the first name when name is present", () => {
    const mockUser = fakeUserComplete();
    const user = { ...mockUser, name: "John Doe" };

    expect(composeUserDisplayName(user)).toBe("John");
  });

  it("should return @email when name is missing", () => {
    const mockUser = fakeUserComplete();
    const user = { ...mockUser, name: null, email: "john@example.com" };

    expect(composeUserDisplayName(user)).toBe("@john");
  });
});

describe("isAdmin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should always return true in development", () => {
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");

    expect(isAdmin({ email: "unknown@example.com" })).toBe(true);
  });

  it("should allow listed emails in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NODE_ENV", "production");

    expect(isAdmin({ email: "john.doe@example.com" })).toBe(true);
    expect(isAdmin({ email: "marloncercedo@gmail.com" })).toBe(true);
  });

  it("should match allowlisted emails case-insensitively", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NODE_ENV", "production");

    expect(isAdmin({ email: "John.Doe@example.com" })).toBe(true);
    expect(isAdmin({ email: "MarlonCercedo@gmail.com" })).toBe(true);
  });

  it("should reject unknown emails in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NODE_ENV", "production");

    expect(isAdmin({ email: "other@example.com" })).toBe(false);
  });

  it("should treat Vercel preview like production", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NODE_ENV", "production");

    expect(isAdmin({ email: "john.doe@example.com" })).toBe(true);
    expect(isAdmin({ email: "other@example.com" })).toBe(false);
  });
});
