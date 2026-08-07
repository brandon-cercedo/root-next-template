import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getTimeOfDay } from "@/lib/utils/date";

describe("getTimeOfDay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { hour: 5, expected: "morning" },
    { hour: 11, expected: "morning" },
    { hour: 12, expected: "afternoon" },
    { hour: 16, expected: "afternoon" },
    { hour: 17, expected: "evening" },
    { hour: 20, expected: "evening" },
    { hour: 21, expected: "night" },
    { hour: 4, expected: "night" },
  ])("returns $expected at hour $hour", ({ hour, expected }) => {
    vi.setSystemTime(new Date(2026, 0, 1, hour, 0, 0));
    expect(getTimeOfDay()).toBe(expected);
  });
});
