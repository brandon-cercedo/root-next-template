"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ChatSessionsContextType = {
  isRead: (id: string) => boolean;
  setIsRead: (id: string, nextIsRead: boolean) => void;
};

const ChatSessionsContext = createContext<ChatSessionsContextType | undefined>(
  undefined
);

/**
 * Keeps UI state that belongs to many chats at once.
 *
 * @note `unreadIds`: ids of the chats with a reply the user has not seen.
 */
export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [unreadIds, setUnreadIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const isRead = (id: string) => !unreadIds.has(id);

  const setIsRead = useCallback((id: string, nextIsRead: boolean) => {
    setUnreadIds((ids) => {
      const isRead = !ids.has(id);
      if (isRead === nextIsRead) {
        return ids;
      }

      const nextIds = new Set(ids);
      if (nextIsRead) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }
      return nextIds;
    });
  }, []);

  return (
    <ChatSessionsContext.Provider value={{ isRead, setIsRead }}>
      {children}
    </ChatSessionsContext.Provider>
  );
}

export function useChatSessions() {
  const context = useContext(ChatSessionsContext);
  if (!context) {
    throw new Error(
      "useChatSessions must be used within a ChatSessionsProvider"
    );
  }
  return context;
}
