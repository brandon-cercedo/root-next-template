import { describe, expect, it, vi } from "vitest";

import {
  composeUserMessage,
  filterArchivedChatSessions,
  getChatStats,
  getChatTitle,
  getLastMessageAt,
} from "@/features/chat/utils";
import { fakeChatSessionComplete } from "@/prisma/utils/fake-data";

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

describe("composeUserMessage", () => {
  it("should build a timestamped user text message", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T12:00:00.000Z"));

    try {
      expect(composeUserMessage("Hello")).toEqual({
        id: expect.any(String),
        role: "user",
        parts: [{ type: "text", text: "Hello" }],
        metadata: { timestamp: "2026-09-16T12:00:00.000Z" },
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("should generate a unique id per message", () => {
    expect(composeUserMessage("a").id).not.toBe(composeUserMessage("a").id);
  });
});

describe("getLastMessageAt", () => {
  it("should use the last message timestamp", () => {
    const messages = [
      message("user"),
      {
        ...message("assistant"),
        metadata: { timestamp: "2026-02-03T14:31:00.000Z" },
      },
    ];

    expect(getLastMessageAt(messages)).toEqual(
      new Date("2026-02-03T14:31:00.000Z")
    );
  });

  it("should fall back to now without messages", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T12:00:00.000Z"));

    try {
      expect(getLastMessageAt([])).toEqual(
        new Date("2026-09-16T12:00:00.000Z")
      );
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("getChatTitle", () => {
  it("should keep a short first line as is", () => {
    expect(getChatTitle("Hello world\nSecond line")).toBe("Hello world");
  });

  it("should collapse whitespace", () => {
    expect(getChatTitle("  Hello   world  ")).toBe("Hello world");
  });

  it("should drop a word cut by the length limit", () => {
    expect(
      getChatTitle(
        "What is the recommended length for a title in a dashboard app?"
      )
    ).toBe("What is the recommended length for a title in a dashboard");
  });

  it("should keep the last word when it ends at the limit", () => {
    const text = `${"a".repeat(55)} bcde fgh`;

    expect(getChatTitle(text)).toBe(`${"a".repeat(55)} bcde`);
  });

  it("should hard-cut a single word longer than the limit", () => {
    expect(getChatTitle("a".repeat(80))).toBe("a".repeat(60));
  });
});

describe("filterArchivedChatSessions", () => {
  function composeChat(isArchived: boolean) {
    return { ...fakeChatSessionComplete(), isArchived };
  }

  it("should remove archived chats", () => {
    const active = composeChat(false);
    const archived = composeChat(true);

    expect(filterArchivedChatSessions([active, archived])).toEqual([active]);
  });

  it("should return an empty list when all chats are archived", () => {
    const chats = [composeChat(true), composeChat(true)];

    expect(filterArchivedChatSessions(chats)).toEqual([]);
  });

  it("should return the list unchanged when none are archived", () => {
    const chats = [composeChat(false), composeChat(false)];

    expect(filterArchivedChatSessions(chats)).toEqual(chats);
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
