"use client";

import { mergeClsx } from "@/lib/utils/styles";

import Modal, { OverlayBackdrop } from ".";

type OffcanvasProps = {
  id: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  overlayBackdrop?: OverlayBackdrop;
  isKeyActionsEnabled?: boolean;
};

export default function Offcanvas({
  id,
  trigger,
  children,
  className,
  containerClassName,
  overlayBackdrop,
  isKeyActionsEnabled = true,
}: OffcanvasProps) {
  return (
    <Modal
      id={id}
      trigger={trigger}
      className={mergeClsx(
        "h-full max-w-xs overflow-hidden border-e border-transparent bg-white shadow-none dark:border-transparent dark:bg-neutral-800",
        className
      )}
      containerClassName={mergeClsx(
        "absolute end-3 top-3 bottom-3 m-0 w-full max-w-xs translate-x-full transform opacity-100 transition-all duration-300 hs-overlay-open:mt-0 hs-overlay-open:translate-x-0 hs-overlay-open:opacity-100 hs-overlay-open:duration-300",
        containerClassName
      )}
      size="auto"
      overlayBackdrop={overlayBackdrop}
      isKeyActionsEnabled={isKeyActionsEnabled}
    >
      {children}
    </Modal>
  );
}
