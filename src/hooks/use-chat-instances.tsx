"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { isChatWorking } from "@/lib/utils/db/chat";

import type { ChatUIMessage } from "@/types/chat";
import type { Chat } from "@ai-sdk/react";

type ChatInstance = Chat<ChatUIMessage>;
type ChatInstances = ReadonlyMap<string, ChatInstance>;

type ChatInstancesContextType = {
  instances: ChatInstances;
  getOrCreateInstance: (options: {
    id: string;
    create: () => ChatInstance;
  }) => ChatInstance;
  deleteInstance: (id: string) => void;
};

const ChatInstancesContext = createContext<
  ChatInstancesContextType | undefined
>(undefined);

/**
 * Keeps one `ChatInstance` per chat id and shares it with the whole UI.
 *
 * @note `store`: the real list of chats.
 * - It is private.
 * - It is changed in place, so a created chat is ready for any other caller in
 *   that same render.
 * - Changing it does not re-render anything, so components never read it.
 *
 * @note `instances`: a read-only copy of `store` kept in state.
 * - Components should read this one. When it changes, they re-render.
 *
 * @note `enqueue`: copies `store` into `instances` in a microtask
 * - Chats are created while a child is rendering, and React does not allow the
 *   provider to update in the middle of that render.
 * - Call it after every change to `store`.
 */
export function ChatInstancesProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new Map<string, ChatInstance>());
  const [instances, setInstances] = useState<ChatInstances>(() => new Map());

  const enqueue = useCallback(() => {
    queueMicrotask(() => setInstances(new Map(store)));
  }, [store]);

  const getOrCreateInstance = useCallback(
    ({ id, create }: { id: string; create: () => ChatInstance }) => {
      const instance = store.get(id);
      if (instance) {
        return instance;
      }

      const newInstance = create();
      store.set(id, newInstance);
      enqueue();

      return newInstance;
    },
    [store, enqueue]
  );

  const deleteInstance = useCallback(
    (id: string) => {
      store.delete(id);
      enqueue();
    },
    [store, enqueue]
  );

  useEffect(() => {
    const run = (event: BeforeUnloadEvent) => {
      const hasWorkingInstance = Array.from(store.values()).some((instance) =>
        isChatWorking(instance.status)
      );
      if (!hasWorkingInstance) {
        return;
      }
      event.preventDefault();
    };

    window.addEventListener("beforeunload", run);
    return () => window.removeEventListener("beforeunload", run);
  }, [store]);

  return (
    <ChatInstancesContext.Provider
      value={{
        instances,
        getOrCreateInstance,
        deleteInstance,
      }}
    >
      {children}
    </ChatInstancesContext.Provider>
  );
}

export function useChatInstances() {
  const context = useContext(ChatInstancesContext);
  if (!context) {
    throw new Error(
      "useChatInstances must be used within a ChatInstancesProvider"
    );
  }
  return context;
}
