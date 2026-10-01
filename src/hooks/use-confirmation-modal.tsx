"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { OVERLAY_IDS } from "@/components/constants";
import { useOverlay } from "@/hooks/use-overlay";

type ConfirmationButton = {
  label?: string;
  handler?: () => void | Promise<void>;
  className?: string;
};

export type ConfirmationOptions = {
  title: string;
  message: ReactNode;
  closeButton?: ConfirmationButton;
  confirmButton?: ConfirmationButton;
};

type ConfirmationContextType = {
  options?: ConfirmationOptions;
  openConfirmation: (options: ConfirmationOptions) => Promise<void>;
  handleConfirm: () => Promise<void>;
  handleCancel: () => Promise<void>;
};

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(
  undefined
);

export function ConfirmationModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [options, setOptions] = useState<ConfirmationOptions>();
  const { open, close } = useOverlay();

  const openConfirmation = async (nextOptions: ConfirmationOptions) => {
    setOptions(nextOptions);
    await open(OVERLAY_IDS.CONFIRMATION);
  };

  const handleConfirm = async () => {
    await options?.confirmButton?.handler?.();
    await close(OVERLAY_IDS.CONFIRMATION);
  };

  const handleCancel = async () => {
    await options?.closeButton?.handler?.();
    await close(OVERLAY_IDS.CONFIRMATION);
  };

  return (
    <ConfirmationContext.Provider
      value={{ options, openConfirmation, handleConfirm, handleCancel }}
    >
      {children}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmationModal() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      "useConfirmationModal must be used within a ConfirmationModalProvider"
    );
  }
  return context;
}
