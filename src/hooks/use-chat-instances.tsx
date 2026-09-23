"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ChatInstancesContextType = {
  instances: Map<string, unknown>;
  getOrCreateInstance: <T>(options: { id: string; create: () => T }) => T;
  deleteInstance: (id: string) => void;
};

const ChatInstancesContext = createContext<
  ChatInstancesContextType | undefined
>(undefined);

export function ChatInstancesProvider({ children }: { children: ReactNode }) {
  const [instances] = useState(() => new Map<string, unknown>());

  const getOrCreateInstance = useCallback(
    <T,>({ id, create }: { id: string; create: () => T }) => {
      const instance = instances.get(id) as T | undefined;
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
