import { describe, expect, it } from "vitest";

import { getChatStats, getChatTitle } from "@/features/chat/utils";

import type { ChatUIMessage } from "@/types/chat";

function message(
  role: ChatUIMessage["role"],
  durationMs?: number
): ChatUIMessage {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [],
    metadata: { timestamp: "2026-02-03T14:30:00.000Z", durationMs },
  };
}

describe("getChatTitle", () => {
  it("should truncate the first line", () => {
    expect(getChatTitle("Hello world")).toBe("Hello world");
  });
});

describe("getChatStats", () => {
  it("should count roles and compute reply durations", () => {
    const result = getChatStats({
      messages: [
        message("user"),
        message("assistant", 1200),
        message("user"),
        message("assistant", 800),
        message("assistant", 2500),
        message("system"),
      ],
    });

    expect(result).toEqual({
      userCount: 2,
      assistantCount: 3,
      totalDurationMs: 4500,
      durationsMs: [1200, 800, 2500],
      averageDurationMs: 1500,
      fastestDurationMs: 800,
      slowestDurationMs: 2500,
    });
  });

  it("should treat a missing duration as zero", () => {
    const result = getChatStats({
      messages: [message("assistant"), message("assistant", 500)],
    });

    expect(result.totalDurationMs).toBe(500);
    expect(result.averageDurationMs).toBe(250);
    expect(result.fastestDurationMs).toBe(0);
    expect(result.slowestDurationMs).toBe(500);
  });

  it("should return empty stats for a chat without messages", () => {
    expect(getChatStats({ messages: [] })).toEqual({
      userCount: 0,
      assistantCount: 0,
      totalDurationMs: 0,
      durationsMs: [],
      averageDurationMs: 0,
      fastestDurationMs: 0,
      slowestDurationMs: 0,
    });
  });
});
