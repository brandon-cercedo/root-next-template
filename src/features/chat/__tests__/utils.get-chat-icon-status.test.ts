import { describe, expect, it } from "vitest";

import { getChatIconStatus } from "@/features/chat/utils";

import type {
  ChatSession,
  ChatSessionStatus,
} from "@/prisma/types/generated/browser";
import type { ChatStatus } from "ai";

describe("getChatIconStatus", () => {
  function composeChat(
    status: ChatSessionStatus,
    isArchived = false
  ): Pick<ChatSession, "isArchived" | "status"> {
    return { status, isArchived };
  }

  it("should return new when there is no chat", () => {
    expect(getChatIconStatus({})).toBe("new");
  });

  it("should prefer archived over any status", () => {
    const chat = composeChat("streaming", true);

    expect(getChatIconStatus({ chat, liveStatus: "streaming" })).toBe(
      "archived"
    );
  });

  it.each<[ChatSessionStatus, string]>([
    ["ready", "ready"],
    ["submitted", "working"],
    ["streaming", "working"],
    ["error", "error"],
    ["aborted", "aborted"],
  ])("should map session status %s to %s", (status, expected) => {
    expect(getChatIconStatus({ chat: composeChat(status) })).toBe(expected);
  });

  it.each<[ChatStatus, string]>([
    ["submitted", "working"],
    ["streaming", "working"],
    ["error", "error"],
  ])("should prefer live status %s over the session", (live, expected) => {
    const chat = composeChat("ready");

    expect(getChatIconStatus({ chat, liveStatus: live })).toBe(expected);
  });

  it.each<ChatSessionStatus>(["error", "aborted"])(
    "should keep the session %s outcome while the live chat is ready",
    (status) => {
      const chat = composeChat(status);

      expect(getChatIconStatus({ chat, liveStatus: "ready" })).toBe(status);
    }
  );

  it("should ignore a stale working session once the live chat is ready", () => {
    const chat = composeChat("streaming");

    expect(getChatIconStatus({ chat, liveStatus: "ready" })).toBe("ready");
  });

  it("should mark a ready chat as unread", () => {
    const chat = composeChat("ready");

    expect(
      getChatIconStatus({ chat, liveStatus: "ready", isRead: false })
    ).toBe("unread");
  });

  it("should show working over unread", () => {
    const chat = composeChat("ready");

    expect(
      getChatIconStatus({ chat, liveStatus: "streaming", isRead: false })
    ).toBe("working");
  });
});
