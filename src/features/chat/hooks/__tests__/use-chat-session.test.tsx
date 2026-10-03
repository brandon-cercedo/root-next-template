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
const mockCloseOverlay = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());
const mockPathname = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-overlay", () => ({
  useOverlay: () => ({
    open: mockOpenOverlay,
    close: mockCloseOverlay,
  }),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({ user: { chatSessions: [chat] } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
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
    mockCloseOverlay.mockReset();
    mockPush.mockReset();
    mockPathname.mockReset();
    mockOpenOverlay.mockResolvedValue(undefined);
    mockCloseOverlay.mockResolvedValue(undefined);
    mockPathname.mockReturnValue(paths.dashboard.home());
  });

  it("should throw when used outside ChatSessionProvider", () => {
    expect(() => renderHook(() => useChatSession())).toThrow(
      "useChatSession must be used within a ChatSessionProvider"
    );
  });

  it("should start with a new chat", () => {
    const { result } = renderChatSession();

    expect(result.current.chatId).toBeUndefined();
    expect(result.current.key).toEqual(expect.any(String));
    expect(result.current.getChat()).toBeUndefined();
  });

  it("should open the overlay and set the chat", () => {
    const { result } = renderChatSession();
    const initialKey = result.current.key;

    act(() => {
      result.current.openChat("chat-1");
    });

    expect(result.current.chatId).toBe("chat-1");
    expect(result.current.key).not.toBe(initialKey);
    expect(mockOpenOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
  });

  it("should keep key when opening the current chat", () => {
    const { result } = renderChatSession();

    act(() => {
      result.current.openChat("chat-1");
    });
    const key = result.current.key;
    act(() => {
      result.current.openChat("chat-1");
    });

    expect(result.current.key).toBe(key);
    expect(mockOpenOverlay).toHaveBeenCalledTimes(2);
  });

  it("should get the open chat from the user chat sessions", () => {
    const { result } = renderChatSession();

    act(() => {
      result.current.openChat(chat.id);
    });

    expect(result.current.getChat()).toBe(chat);
  });

  it("should redirect to new chat when opening the chat of the current page", () => {
    mockPathname.mockReturnValue(paths.dashboard.chat("chat-1"));
    const { result } = renderChatSession();

    act(() => {
      result.current.openChat("chat-1");
    });

    expect(result.current.chatId).toBe("chat-1");
    expect(mockPush).toHaveBeenCalledWith(paths.dashboard.chats());
  });

  it("should stay on the page when opening another chat", () => {
    mockPathname.mockReturnValue(paths.dashboard.chat("chat-2"));
    const { result } = renderChatSession();

    act(() => {
      result.current.openChat("chat-1");
    });

    expect(result.current.chatId).toBe("chat-1");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should stay on the page when opening a new chat", () => {
    mockPathname.mockReturnValue(paths.dashboard.chats());
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
      result.current.openChat("chat-1");
    });
    const key = result.current.key;
    act(() => {
      result.current.openChat();
    });

    expect(result.current.chatId).toBeUndefined();
    expect(result.current.key).not.toBe(key);
  });

  it("should keep key when setting the chat id", () => {
    const { result } = renderChatSession();
    const initialKey = result.current.key;

    act(() => {
      result.current.setChatId("chat-1");
    });

    expect(result.current.chatId).toBe("chat-1");
    expect(result.current.key).toBe(initialKey);
  });

  it("should reset a new chat and close the overlay", () => {
    const { result } = renderChatSession();

    act(() => {
      result.current.openChat();
    });
    const key = result.current.key;
    act(() => {
      result.current.closeChat();
    });

    expect(result.current.chatId).toBeUndefined();
    expect(result.current.key).not.toBe(key);
    expect(mockCloseOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
  });

  it("should close when the id matches the open chat", () => {
    const { result } = renderChatSession();

    act(() => {
      result.current.openChat("chat-1");
    });
    const key = result.current.key;
    act(() => {
      result.current.closeChat("chat-1");
    });

    expect(result.current.chatId).toBeUndefined();
    expect(result.current.key).not.toBe(key);
    expect(mockCloseOverlay).toHaveBeenCalledWith(OVERLAY_IDS.CHAT_OFFCANVAS);
  });

  it("should stay open when the id belongs to another chat", () => {
    const { result } = renderChatSession();

    act(() => {
      result.current.openChat("chat-1");
    });
    const key = result.current.key;
    act(() => {
      result.current.closeChat("chat-2");
    });

    expect(result.current.chatId).toBe("chat-1");
    expect(result.current.key).toBe(key);
    expect(mockCloseOverlay).not.toHaveBeenCalled();
  });
});
