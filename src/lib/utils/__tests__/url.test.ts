import { describe, expect, it, vi } from "vitest";

import { getFullUrl } from "@/lib/utils/url";

vi.mock("@/lib/config/envs", () => {
  const mockedEnvs = { NEXT_PUBLIC_BASE_URL: "https://example.com" };
  return {
    get envs() {
      return mockedEnvs;
    },
  };
});

describe("getFullUrl", () => {
  it("should return full URL with path starting with slash", () => {
    expect(getFullUrl("/dashboard/pages/123")).toBe(
      "https://example.com/dashboard/pages/123"
    );
    expect(getFullUrl("/")).toBe("https://example.com/");
  });

  it("should normalize path without leading slash", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getFullUrl("dashboard/pages/123" as any)).toBe(
      "https://example.com/dashboard/pages/123"
    );
  });

  it("should handle path with query parameters", () => {
    expect(getFullUrl("/dashboard/pages/123?tab=settings")).toBe(
      "https://example.com/dashboard/pages/123?tab=settings"
    );
  });

  it("should handle path with hash", () => {
    expect(getFullUrl("/dashboard/pages/123#section")).toBe(
      "https://example.com/dashboard/pages/123#section"
    );
  });

  it("should handle path with special characters", () => {
    expect(getFullUrl("/dashboard/pages/test-page-123")).toBe(
      "https://example.com/dashboard/pages/test-page-123"
    );
  });
});
