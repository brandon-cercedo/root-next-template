"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { v7 as uuidv7 } from "uuid";

import { OVERLAY_IDS } from "@/components/constants";
import { useOverlay } from "@/hooks/use-overlay";
import { useUser } from "@/hooks/use-user";
import { paths } from "@/lib/config/paths";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatSessionContextType = {
  chatId?: string;
  key: string;
  setChatId: (id?: string) => void;
  getChat: () => ChatSession | undefined;
  openChat: (id?: string) => void;
  closeChat: (id?: string) => void;
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
  const pathname = usePathname();
  const { user } = useUser();
  const { open, close } = useOverlay();
  const [chatId, setChatId] = useState<string | undefined>();
  const [key, setKey] = useState(() => uuidv7());

  const getChat = () => {
    return user.chatSessions.find((session) => session.id === chatId);
  };

  const openChat = (id?: string) => {
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
    const isChatPage = pathname === paths.dashboard.chat(id);
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
        getChat,
        openChat,
        closeChat,
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
