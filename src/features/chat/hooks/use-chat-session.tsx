"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { v7 as uuidv7 } from "uuid";

import { OVERLAY_IDS } from "@/components/constants";
import { useOverlay } from "@/hooks/use-overlay";
import { useUser } from "@/hooks/use-user";
import { paths } from "@/lib/config/paths";
import { ChatSession } from "@/prisma/types/generated/browser";

export type ChatVariant = "page" | "sidebar";

export type DraftMode = "prefill" | "send";

export type ChatDraft = {
  id?: string;
  variant: ChatVariant;
  mode: DraftMode;
  text: string;
};

type ChatSessionContextType = {
  // Side panel (offcanvas)
  chatId?: string;
  key: string;
  setChatId: (id?: string) => void;
  setIsOffcanvasOpen: (isOpen: boolean) => void;
  getChat: () => ChatSession | undefined;
  isOpen: (id: string) => boolean;
  openChat: (params?: Partial<ChatDraft>) => void;
  closeChat: (id?: string) => void;

  // Chat page (/dashboard/chats/[id])
  pageChat?: ChatSession;
  setPageChat: (chat?: ChatSession) => void;

  // Draft chat (command palette)
  draft?: ChatDraft;
  setDraft: (draft?: ChatDraft) => void;
};

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(
  undefined
);

/**
 * @note `key` state: remounts `ChatOffcanvas` > `ChatSection` if another
 * chat is opened or the current one is closed. It stays the same when a new
 * chat is created (empty -> created), so the streaming response is kept.
 */
export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useUser();
  const { open, close } = useOverlay();
  const [chatId, setChatId] = useState<string | undefined>();
  const [key, setKey] = useState(() => uuidv7());
  const [pageChat, setPageChat] = useState<ChatSession>();
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [draft, setDraft] = useState<ChatDraft>();

  const getChat = () => {
    return user.chatSessions.find((session) => session.id === chatId);
  };

  /**
   * Checks if a chat is open in either the chat page or the offcanvas.
   *
   * @note `chatId` outlives a closed offcanvas, so its visibility is checked
   * too.
   */
  const isOpen = (id: string) => {
    const isPageOpen = pageChat?.id === id;
    const isOffcanvasChat = isOffcanvasOpen && chatId === id;
    return isPageOpen || isOffcanvasChat;
  };

  /**
   * Open a chat in the sidebar (default) or the chat page.
   *
   * @note With `text`, it also sets the draft for the target chat.
   */
  const openChat = ({
    id,
    variant = "sidebar",
    mode = "prefill",
    text,
  }: Partial<ChatDraft> = {}) => {
    if (text) {
      setDraft({ id, variant, mode, text });
    }

    if (variant === "page") {
      router.push(id ? paths.dashboard.chat(id) : paths.dashboard.chats());
      return;
    }

    if (id !== chatId) {
      setChatId(id);
      setKey(uuidv7());
    }
    void open(OVERLAY_IDS.CHAT_OFFCANVAS);

    // Handle new chat
    if (!id) {
      return;
    }

    // Handle existing chat
    const isChatPage = pageChat?.id === id;
    if (isChatPage) {
      router.push(paths.dashboard.chats());
    }
  };

  const closeChat = (id?: string) => {
    if (id !== chatId) {
      return;
    }

    setChatId(undefined);
    setKey(uuidv7());
    void close(OVERLAY_IDS.CHAT_OFFCANVAS);
  };

  return (
    <ChatSessionContext.Provider
      value={{
        chatId,
        key,
        setChatId,
        setIsOffcanvasOpen,
        getChat,
        isOpen,
        openChat,
        closeChat,
        pageChat,
        setPageChat,
        draft,
        setDraft,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSession() {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error(
      "useChatSession must be used within a ChatSessionProvider"
    );
  }
  return context;
}
