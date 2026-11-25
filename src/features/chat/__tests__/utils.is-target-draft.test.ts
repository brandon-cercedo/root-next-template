// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isTargetDraft } from "@/features/chat/utils";

import type { ChatDraft } from "@/features/chat/hooks/use-chat-session";

describe("isTargetDraft", () => {
  const draft: ChatDraft = { variant: "sidebar", mode: "send", text: "hi" };

  it("should be true when the draft targets the chat", () => {
    expect(isTargetDraft({ draft, variant: "sidebar" })).toBe(true);
  });

  it("should be false without a draft", () => {
    expect(isTargetDraft({ variant: "sidebar" })).toBe(false);
  });

  it("should be false for another variant", () => {
    expect(isTargetDraft({ draft, variant: "page" })).toBe(false);
  });

  it("should be false for another chat id", () => {
    expect(
      isTargetDraft({ draft, chatId: "chat-1", variant: "sidebar" })
    ).toBe(false);
  });

  it("should be true for a saved chat with the same id", () => {
    const savedDraft: ChatDraft = { ...draft, id: "chat-1" };

    expect(
      isTargetDraft({
        draft: savedDraft,
        chatId: "chat-1",
        variant: "sidebar",
      })
    ).toBe(true);
  });
});
