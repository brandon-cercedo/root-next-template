import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OVERLAY_IDS } from "@/components/constants";
import {
  ChatSessionProvider,
  useChatSession,
} from "@/features/chat/hooks/use-chat-session";
import { paths } from "@/lib/config/paths";
import { fakeChatSessionComplete } from "@/prisma/utils/fake-data";

const chat = fakeChatSessionComplete();

const mockOpenOverlay = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({ open: mockOpenOverlay, close: vi.fn() }),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({ user: { chatSessions: [chat] } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ChatSessionProvider>{children}</ChatSessionProvider>;
}

function renderChatSession() {
  return renderHook(() => useChatSession(), { wrapper: Wrapper });
}

describe("useChatSession", () => {
  beforeEach(() => {
    mockOpenOverlay.mockReset();
    mockPush.mockReset();
    mockOpenOverlay.mockResolvedValue(undefined);
  });

  describe("openChat", () => {
    it("should open the overlay and set the chat", () => {
      const { result } = renderChatSession();
      const initialKey = result.current.key;

      act(() => {
        result.current.openChat({ id: "chat-1" });
      });

      expect(result.current.chatId).toBe("chat-1");
      expect(result.current.key).not.toBe(initialKey);
      expect(mockOpenOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
    });

    it("should keep key when opening the current chat", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.openChat({ id: "chat-1" });
      });
      const key = result.current.key;
      act(() => {
        result.current.openChat({ id: "chat-1" });
      });

      expect(result.current.key).toBe(key);
      expect(mockOpenOverlay).toHaveBeenCalledTimes(2);
    });

    it("should redirect to new chat when opening the chat of the current page", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.setPageChat({ ...chat, id: "chat-1" });
      });
      act(() => {
        result.current.openChat({ id: "chat-1" });
      });

      expect(result.current.chatId).toBe("chat-1");
      expect(mockPush).toHaveBeenCalledWith(paths.dashboard.chats());
    });

    it("should stay on the page when opening another chat", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.setPageChat({ ...chat, id: "chat-2" });
      });
      act(() => {
        result.current.openChat({ id: "chat-1" });
      });

      expect(result.current.chatId).toBe("chat-1");
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should stay on the page when opening a new chat", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.openChat();
      });

      expect(result.current.chatId).toBeUndefined();
      expect(mockOpenOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should switch from an open chat to a new chat", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.openChat({ id: "chat-1" });
      });
      const key = result.current.key;
      act(() => {
        result.current.openChat();
      });

      expect(result.current.chatId).toBeUndefined();
      expect(result.current.key).not.toBe(key);
    });

    it("should not set a draft without text", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.openChat({ id: "chat-1" });
      });

      expect(result.current.draft).toBeUndefined();
    });

    it("should set a prefill draft by default", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.openChat({ text: "hi" });
      });

      expect(result.current.draft).toEqual({
        id: undefined,
        variant: "sidebar",
        mode: "prefill",
        text: "hi",
      });
    });

    it("should set a sidebar draft when opening with text", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.openChat({ mode: "send", text: "hi" });
      });

      expect(result.current.draft).toEqual({
        id: undefined,
        variant: "sidebar",
        mode: "send",
        text: "hi",
      });
      expect(mockOpenOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
    });

    it("should navigate to the chat page for the page variant", () => {
      const { result } = renderChatSession();
      const initialKey = result.current.key;

      act(() => {
        result.current.openChat({ id: "chat-1", variant: "page" });
      });

      expect(mockPush).toHaveBeenCalledWith(paths.dashboard.chat("chat-1"));
      expect(mockOpenOverlay).not.toHaveBeenCalled();
      expect(result.current.chatId).toBeUndefined();
      expect(result.current.key).toBe(initialKey);
    });

    it("should navigate to a new page chat without an id", () => {
      const { result } = renderChatSession();

      act(() => {
        result.current.openChat({ variant: "page", text: "hi" });
      });

      expect(mockPush).toHaveBeenCalledWith(paths.dashboard.chats());
      expect(result.current.draft).toEqual({
        id: undefined,
        variant: "page",
        mode: "prefill",
        text: "hi",
      });
    });
  });
});
