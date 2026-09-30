import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ChatInstancesProvider,
  useChatInstances,
} from "@/hooks/use-chat-instances";

import type { ChatUIMessage } from "@/types/chat";
import type { Chat } from "@ai-sdk/react";
import type { ChatStatus } from "ai";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ChatInstancesProvider>{children}</ChatInstancesProvider>;
}

function createFakeChat(status: ChatStatus = "ready") {
  return { status } as unknown as Chat<ChatUIMessage>;
}

describe("useChatInstances", () => {
  it("should throw when used outside ChatInstancesProvider", () => {
    expect(() => renderHook(() => useChatInstances())).toThrow(
      "useChatInstances must be used within a ChatInstancesProvider"
    );
  });

  it("should reuse the same instance for the same id", () => {
    const { result } = renderHook(() => useChatInstances(), {
      wrapper: Wrapper,
    });
    const firstChat = createFakeChat();

    const first = result.current.getOrCreateInstance({
      id: "a",
      create: () => firstChat,
    });
    const second = result.current.getOrCreateInstance({
      id: "a",
      create: () => createFakeChat(),
    });

    expect(first).toBe(firstChat);
    expect(second).toBe(firstChat);
  });

  it("should delete an instance by id", () => {
    const { result } = renderHook(() => useChatInstances(), {
      wrapper: Wrapper,
    });
    const firstChat = createFakeChat();
    const secondChat = createFakeChat();

    result.current.getOrCreateInstance({
      id: "a",
      create: () => firstChat,
    });
    result.current.deleteInstance("a");

    const recreated = result.current.getOrCreateInstance({
      id: "a",
      create: () => secondChat,
    });

    expect(recreated).toBe(secondChat);
  });

  describe("beforeunload", () => {
    function dispatchBeforeUnload() {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event;
    }

    function renderWithStatuses(statuses: ChatStatus[]) {
      const rendered = renderHook(() => useChatInstances(), {
        wrapper: Wrapper,
      });
      statuses.forEach((status, index) => {
        rendered.result.current.getOrCreateInstance({
          id: String(index),
          create: () => createFakeChat(status),
        });
      });
      return rendered;
    }

    it.each<ChatStatus>(["submitted", "streaming"])(
      "should prevent unload when a chat is %s",
      (status) => {
        const { unmount } = renderWithStatuses(["ready", status]);

        expect(dispatchBeforeUnload().defaultPrevented).toBe(true);

        unmount();
      }
    );

    it("should allow unload when every chat is idle", () => {
      const { unmount } = renderWithStatuses(["ready", "error"]);

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false);

      unmount();
    });

    it("should allow unload when there are no chats", () => {
      const { unmount } = renderWithStatuses([]);

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false);

      unmount();
    });

    it("should remove the listener on unmount", () => {
      const { unmount } = renderWithStatuses(["streaming"]);
      unmount();

      expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
    });
  });
});
