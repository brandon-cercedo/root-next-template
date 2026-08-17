import moment from "moment";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getTimeOfDay, humanizeDate } from "@/lib/utils/date";

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
  ])("should return $expected at hour $hour", ({ hour, expected }) => {
    vi.setSystemTime(new Date(2026, 0, 1, hour, 0, 0));
    expect(getTimeOfDay()).toBe(expected);
  });
});

describe("humanizeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:02:00Z"));
    moment.locale("en");
  });

  afterEach(() => {
    vi.useRealTimers();
    moment.locale("en");
  });

  it("should return default relative time when using base size", () => {
    expect(humanizeDate("2024-01-01T00:01:00Z")).toBe("a minute ago");
    expect(humanizeDate("2023-12-31T23:01:00Z")).toBe("an hour ago");
    expect(humanizeDate("2024-01-01T00:07:00Z")).toBe("in 5 minutes");
    expect(humanizeDate("2024-01-01T01:01:00Z")).toBe("in an hour");
  });

  it("should use medium locale formatting for sm size", () => {
    const size = "sm";

    expect(humanizeDate("2024-01-01T00:01:00Z", size)).toBe("1 min ago");
    expect(humanizeDate("2023-12-31T23:01:00Z", size)).toBe("1 hr ago");
    expect(humanizeDate("2024-01-01T00:07:00Z", size)).toBe("in 5 min");
    expect(humanizeDate("2024-01-01T01:01:00Z", size)).toBe("in 1 hr");
  });

  it("should use compact locale formatting for xs size", () => {
    const size = "xs";

    expect(humanizeDate("2024-01-01T00:01:00Z", size)).toBe("1m ago");
    expect(humanizeDate("2023-12-31T23:01:00Z", size)).toBe("1h ago");
    expect(humanizeDate("2024-01-01T00:07:00Z", size)).toBe("in 5m");
    expect(humanizeDate("2024-01-01T01:01:00Z", size)).toBe("in 1h");
  });
});
