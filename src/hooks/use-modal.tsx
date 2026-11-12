"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useOverlay } from "@/hooks/use-overlay";

type ModalContextType = {
  id: string;
  isMounted: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
  toggle: () => Promise<void>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({
  id,
  isMounted,
  children,
}: {
  id: string;
  isMounted: boolean;
  children: ReactNode;
}) {
  const {
    open: openOverlay,
    close: closeOverlay,
    toggle: toggleOverlay,
  } = useOverlay();

  const open = async () => await openOverlay(id);

  const close = async () => await closeOverlay(id);

  const toggle = async () => await toggleOverlay(id);

  return (
    <ModalContext.Provider
      value={{
        id,
        isMounted,
        open,
        close,
        toggle,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
