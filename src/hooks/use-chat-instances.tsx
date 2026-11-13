"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { isChatWorking } from "@/lib/utils/db/chat";

import type { ChatUIMessage } from "@/types/chat";
import type { Chat } from "@ai-sdk/react";

type InstanceStoreListener = () => void;

/**
 * Create an external store with the chat instances to be read with
 * `useSyncExternalStore`.
 *
 * @note `items`: the real list of chats, read-only from outside.
 * - It is changed in place, so a created chat is ready for any other caller in
 *   that same render.
 * - Change it only through `setItem` and `deleteItem`.
 *
 * @note `notify`: copies `items` into the snapshot in a microtask.
 * - Chats are created while a child is rendering, and React does not allow the
 *   provider to update in the middle of that render.
 *
 * @note `serverSnapshot`: one empty map, created once.
 * - React needs `getServerSnapshot` to return the same object on every call.
 *
 * @note `snapshot`: starts as the same `serverSnapshot` map.
 * - So hydration matches the server render.
 * - `notify` replaces `snapshot` later; `serverSnapshot` stays empty.
 */
function createInstanceStore() {
  const items = new Map<string, ChatInstance>();
  const listeners = new Set<InstanceStoreListener>();
  const serverSnapshot: ChatInstances = new Map();
  let snapshot = serverSnapshot;

  const notify = () => {
    queueMicrotask(() => {
      snapshot = new Map(items);
      listeners.forEach((listener) => listener());
    });
  };

  const setItem = (id: string, instance: ChatInstance) => {
    items.set(id, instance);
    notify();
  };

  const deleteItem = (id: string) => {
    items.delete(id);
    notify();
  };

  const subscribe = (listener: InstanceStoreListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = () => snapshot;

  const getServerSnapshot = () => serverSnapshot;

  return {
    items: items as ChatInstances,
    set: setItem,
    delete: deleteItem,
    subscribe,
    getSnapshot,
    getServerSnapshot,
  };
}

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
 * @note `instances`: a read-only snapshot of the store.
 * - Components should read this one. When it changes, they re-render.
 */
export function ChatInstancesProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createInstanceStore);
  const instances = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const getOrCreateInstance = useCallback(
    ({ id, create }: { id: string; create: () => ChatInstance }) => {
      const instance = store.items.get(id);
      if (instance) {
        return instance;
      }

      const newInstance = create();
      store.set(id, newInstance);

      return newInstance;
    },
    [store]
  );

  const deleteInstance = useCallback(
    (id: string) => {
      store.delete(id);
    },
    [store]
  );

  useEffect(() => {
    const run = (event: BeforeUnloadEvent) => {
      const hasWorkingInstance = Array.from(store.items.values()).some(
        (instance) => isChatWorking(instance.status)
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
