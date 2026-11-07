import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { searchChatSessions } from "@/app/dashboard/_components/command-palette/hooks/use-command-palette-search";
import { fakeChatSessionComplete } from "@/prisma/utils/fake-data";

const NOW = new Date("2026-11-04T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function composeChat({
  title = "Chat",
  isArchived = false,
  daysAgo = 0,
}: {
  title?: string;
  isArchived?: boolean;
  daysAgo?: number;
}) {
  return {
    ...fakeChatSessionComplete(),
    title,
    isArchived,
    lastMessageAt: new Date(NOW.getTime() - daysAgo * DAY_MS),
  };
}

function getTitles(chats: { title: string }[]) {
  return chats.map((chat) => chat.title);
}

describe("searchChatSessions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("with falsy `searchText`", () => {
    it("should return active chats from the last 7 days, newest first", () => {
      const chats = [
        composeChat({ title: "Older", daysAgo: 3 }),
        composeChat({ title: "Newer", daysAgo: 1 }),
        composeChat({ title: "Edge", daysAgo: 7 }),
        composeChat({ title: "Stale", daysAgo: 8 }),
      ];

      const result = searchChatSessions({ chats, searchText: "" });

      expect(getTitles(result)).toEqual(["Newer", "Older", "Edge"]);
    });

    it("should exclude archived chats", () => {
      const chats = [
        composeChat({ title: "Active" }),
        composeChat({ title: "Archived", isArchived: true }),
      ];

      const result = searchChatSessions({ chats, searchText: "" });

      expect(getTitles(result)).toEqual(["Active"]);
    });

    it("should treat a whitespace-only search as empty", () => {
      const chats = [
        composeChat({ title: "Active" }),
        composeChat({ title: "Archived", isArchived: true }),
      ];

      const result = searchChatSessions({ chats, searchText: "   " });

      expect(getTitles(result)).toEqual(["Active"]);
    });
  });

  describe("with truthy `searchText`", () => {
    it("should match titles case-insensitively across all chats", () => {
      const chats = [
        composeChat({ title: "React hooks", daysAgo: 30 }),
        composeChat({ title: "Prisma setup" }),
        composeChat({ title: "Next.js routing" }),
      ];

      const result = searchChatSessions({ chats, searchText: "  REACT " });

      expect(getTitles(result)).toEqual(["React hooks"]);
    });

    it("should match every chat by the `Chats` group name", () => {
      const chats = [
        composeChat({ title: "React hooks" }),
        composeChat({ title: "Old", isArchived: true, daysAgo: 30 }),
      ];

      const result = searchChatSessions({ chats, searchText: "CHAT" });

      expect(getTitles(result)).toEqual(["React hooks", "Old"]);
    });

    it("should list active chats first, then archived chats", () => {
      const chats = [
        composeChat({ title: "Chat archived new", isArchived: true }),
        composeChat({ title: "Chat active old", daysAgo: 20 }),
        composeChat({ title: "Chat active new", daysAgo: 1 }),
        composeChat({
          title: "Chat archived old",
          isArchived: true,
          daysAgo: 9,
        }),
      ];

      const result = searchChatSessions({ chats, searchText: "chat" });

      expect(getTitles(result)).toEqual([
        "Chat active new",
        "Chat active old",
        "Chat archived new",
        "Chat archived old",
      ]);
    });

    it("should return an empty list when nothing matches", () => {
      const chats = [composeChat({ title: "React hooks" })];

      const result = searchChatSessions({ chats, searchText: "vue" });

      expect(result).toEqual([]);
    });
  });
});
