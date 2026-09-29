"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { ChatUIMessage } from "@/types/chat";
import type { Chat } from "@ai-sdk/react";

type ChatInstance = Chat<ChatUIMessage>;

function isActiveInstance(instance: ChatInstance) {
  return ["submitted", "streaming"].includes(instance.status);
}

type ChatInstancesContextType = {
  instances: Map<string, ChatInstance>;
  getOrCreateInstance: (options: {
    id: string;
    create: () => ChatInstance;
  }) => ChatInstance;
  deleteInstance: (id: string) => void;
};

const ChatInstancesContext = createContext<
  ChatInstancesContextType | undefined
>(undefined);

export function ChatInstancesProvider({ children }: { children: ReactNode }) {
  const [instances] = useState(() => new Map<string, ChatInstance>());

  const getOrCreateInstance = useCallback(
    ({ id, create }: { id: string; create: () => ChatInstance }) => {
      const instance = instances.get(id);
      if (instance) {
        return instance;
      }

      const newInstance = create();
      instances.set(id, newInstance);

      return newInstance;
    },
    [instances]
  );

  const deleteInstance = useCallback(
    (id: string) => {
      instances.delete(id);
    },
    [instances]
  );

  useEffect(() => {
    const run = (event: BeforeUnloadEvent) => {
      const hasActiveInstance = Array.from(instances.values()).some(
        isActiveInstance
      );
      if (!hasActiveInstance) {
        return;
      }
      event.preventDefault();
    };

    window.addEventListener("beforeunload", run);
    return () => window.removeEventListener("beforeunload", run);
  }, [instances]);

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
