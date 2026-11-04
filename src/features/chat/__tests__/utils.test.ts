import { describe, expect, it, vi } from "vitest";

import {
  composeUserMessage,
  filterArchivedChatSessions,
  getChatStats,
  getChatTitle,
  getLastMessageAt,
  getMessagePetParts,
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

describe("getMessagePetParts", () => {
  type MessagePart = ChatUIMessage["parts"][number];

  function assistantMessage(parts: MessagePart[]): ChatUIMessage {
    return { ...message("assistant"), parts };
  }

  const inputPart: MessagePart = {
    type: "tool-showPet",
    toolCallId: "call-1",
    state: "input-available",
    input: { style: "pixel" },
  };
  const outputPart: MessagePart = {
    type: "tool-showPet",
    toolCallId: "call-2",
    state: "output-available",
    input: {},
    output: { success: true },
  };
  const approval = { id: "approval-1" };

  it("should return showPet parts with available input in order", () => {
    const chatMessage = assistantMessage([
      outputPart,
      { type: "text", text: "Hi!" },
      inputPart,
    ]);

    expect(getMessagePetParts(chatMessage)).toEqual([outputPart, inputPart]);
  });

  it.each<MessagePart>([
    {
      type: "tool-showPet",
      toolCallId: "call-3",
      state: "input-streaming",
      input: {},
    },
    {
      type: "tool-showPet",
      toolCallId: "call-3",
      state: "approval-requested",
      input: {},
      approval,
    },
    {
      type: "tool-showPet",
      toolCallId: "call-3",
      state: "approval-responded",
      input: {},
      approval: { ...approval, approved: true },
    },
    {
      type: "tool-showPet",
      toolCallId: "call-3",
      state: "output-error",
      input: {},
      errorText: "Failed",
    },
    {
      type: "tool-showPet",
      toolCallId: "call-3",
      state: "output-denied",
      input: {},
      approval: { ...approval, approved: false },
    },
  ])("should skip showPet parts in the $state state", (part) => {
    const chatMessage = assistantMessage([part, inputPart]);

    expect(getMessagePetParts(chatMessage)).toEqual([inputPart]);
  });

  it("should skip parts from other tools with available input", () => {
    const keyboardPart: MessagePart = {
      type: "tool-runKeyboardCommand",
      toolCallId: "call-4",
      state: "input-available",
      input: { commandId: "theme-dark" },
    };
    const chatMessage = assistantMessage([keyboardPart, inputPart]);

    expect(getMessagePetParts(chatMessage)).toEqual([inputPart]);
  });
});
