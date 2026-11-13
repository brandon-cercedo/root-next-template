import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ChatSessionsProvider,
  useChatSessions,
} from "@/features/chat/hooks/use-chat-sessions";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ChatSessionsProvider>{children}</ChatSessionsProvider>;
}

function renderChatSessions() {
  return renderHook(() => useChatSessions(), { wrapper: Wrapper });
}

describe("useChatSessions", () => {
  it("should throw when used outside ChatSessionsProvider", () => {
    expect(() => renderHook(() => useChatSessions())).toThrow(
      "useChatSessions must be used within a ChatSessionsProvider"
    );
  });

  it("should start with every chat as read", () => {
    const { result } = renderChatSessions();

    expect(result.current.isRead("chat-1")).toBe(true);
  });

  describe("setIsRead to false", () => {
    it("should mark only the given chat as unread", () => {
      const { result } = renderChatSessions();

      act(() => {
        result.current.setIsRead("chat-1", false);
      });

      expect(result.current.isRead("chat-1")).toBe(false);
      expect(result.current.isRead("chat-2")).toBe(true);
    });

    it("should skip the update when the chat is already unread", () => {
      let renders = 0;
      const { result } = renderHook(
        () => {
          renders += 1;
          return useChatSessions();
        },
        { wrapper: Wrapper }
      );

      act(() => {
        result.current.setIsRead("chat-1", false);
      });
      const rendersAfterFirst = renders;
      act(() => {
        result.current.setIsRead("chat-1", false);
      });

      expect(renders).toBe(rendersAfterFirst);
    });
  });

  describe("setIsRead to true", () => {
    it("should mark an unread chat as read", () => {
      const { result } = renderChatSessions();

      act(() => {
        result.current.setIsRead("chat-1", false);
        result.current.setIsRead("chat-2", false);
      });
      act(() => {
        result.current.setIsRead("chat-1", true);
      });

      expect(result.current.isRead("chat-1")).toBe(true);
      expect(result.current.isRead("chat-2")).toBe(false);
    });

    it("should skip the update when the chat is already read", () => {
      let renders = 0;
      const { result } = renderHook(
        () => {
          renders += 1;
          return useChatSessions();
        },
        { wrapper: Wrapper }
      );
      const rendersAtStart = renders;

      act(() => {
        result.current.setIsRead("chat-1", true);
      });

      expect(renders).toBe(rendersAtStart);
    });
  });
});
