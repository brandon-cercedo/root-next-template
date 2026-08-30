import { afterEach, describe, expect, it, vi } from "vitest";

import { isDevelopment, isPreview, isProduction } from "@/lib/config/envs";

describe("isProduction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should be true for VERCEL_ENV production", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    expect(isProduction()).toBe(true);
    expect(isPreview()).toBe(false);
    expect(isDevelopment()).toBe(false);
  });

  it("should be false for preview and development", () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(isProduction()).toBe(false);
  });

  it("should be false for development", () => {
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");

    expect(isProduction()).toBe(false);
  });

  it("should treat non-Vercel prod build as production", () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "production");

    expect(isProduction()).toBe(true);
  });
});

describe("isPreview", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should be true for VERCEL_ENV preview", () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(isPreview()).toBe(true);
    expect(isProduction()).toBe(false);
    expect(isDevelopment()).toBe(false);
  });

  it("should be false for production and development", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    expect(isPreview()).toBe(false);
  });
});

describe("isDevelopment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should be true for VERCEL_ENV development", () => {
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");

    expect(isDevelopment()).toBe(true);
    expect(isProduction()).toBe(false);
    expect(isPreview()).toBe(false);
  });

  it("should be true when VERCEL_ENV is unset and NODE_ENV is development", () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "development");

    expect(isDevelopment()).toBe(true);
  });

  it("should be false for production and preview", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    expect(isDevelopment()).toBe(false);
  });
});
