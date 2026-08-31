"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useOverlay } from "@/hooks/use-overlay";

type ModalContextType = {
  id: string;
  isMounted: boolean;
  isOpen: boolean;
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
    getInstance,
    isOpen: isOverlayOpen,
    open: openOverlay,
    close: closeOverlay,
    toggle: toggleOverlay,
  } = useOverlay();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    let cancelled = false;

    async function run() {
      const instance = await getInstance(id);
      if (!instance || cancelled) {
        return;
      }

      const setState = (value: boolean) => {
        if (cancelled) {
          return;
        }
        setIsOpen(value);
      };

      instance.on("open", () => setState(true));
      instance.on("close", () => setState(false));

      const open = await isOverlayOpen(instance);
      setState(open);
    }
    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isMounted]);

  const open = async () => await openOverlay(id);

  const close = async () => await closeOverlay(id);

  const toggle = async () => await toggleOverlay(id);

  return (
    <ModalContext.Provider
      value={{
        id,
        isMounted,
        isOpen,
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
