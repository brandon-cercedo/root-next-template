"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import { OVERLAY_IDS, OverlayAction } from "@/components/constants";
import { useOverlay } from "@/hooks/use-overlay";
import { ChatSession } from "@/prisma/types/generated/browser";

type ChatSessionContextType = {
  chat?: ChatSession;
  setChat: (chat?: ChatSession, action?: OverlayAction) => void;
};

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(
  undefined
);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [currentChat, setCurrentChat] = useState<ChatSession | undefined>();
  const { open } = useOverlay();

  const setChat = (chat?: ChatSession, action?: OverlayAction) => {
    setCurrentChat(chat);

    if (action === OverlayAction.DELETE) {
      void open(OVERLAY_IDS.CHAT_DELETE);
    }
  };

  return (
    <ChatSessionContext.Provider value={{ chat: currentChat, setChat }}>
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
