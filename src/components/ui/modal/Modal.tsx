"use client";

import clsx from "clsx";
import { Fragment, KeyboardEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { mergeClsx } from "@/lib/utils/styles";

import ModalTrigger from "./ModalTrigger";

interface ModalContentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  size?: ModalSize;
  overlayBackdrop?: OverlayBackdrop;
  scrollScope?: ScrollScope;
  isVerticallyCentered?: boolean;
  isKeyActionsEnabled?: boolean;
}

function ModalContent({
  id,
  children,
  className,
  size = "sm",
  overlayBackdrop,
  scrollScope = "body",
  isVerticallyCentered = false,
  isKeyActionsEnabled = true,
}: ModalContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    if (isKeyActionsEnabled) {
      return;
    }
    event.stopPropagation();
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      id={id}
      className={clsx(
        "hs-overlay pointer-events-none fixed start-0 top-0 z-80 hidden size-full overflow-x-hidden overflow-y-auto",
        {
          "[--overlay-backdrop:static]": overlayBackdrop === "static",
        }
      )}
      role="dialog"
      tabIndex={-1}
      onKeyDownCapture={handleKeyDownCapture}
    >
      <div
        className={clsx(
          "m-3 mt-0 opacity-0 transition-all ease-out hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500",
          {
            "sm:mx-auto sm:w-full sm:max-w-lg": size === "sm",
            "md:mx-auto md:w-full md:max-w-2xl": size === "md",
            "lg:mx-auto lg:w-full lg:max-w-4xl": size === "lg",
            "flex min-h-[calc(100%-56px)] items-center": isVerticallyCentered,
            "h-[calc(100%-56px)]": scrollScope === "parent",
          }
        )}
      >
        <div
          className={mergeClsx(
            "pointer-events-auto flex w-full flex-col rounded-xl border border-gray-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800",
            {
              "max-h-full overflow-hidden": scrollScope === "parent",
            },
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

type ModalSize = "sm" | "md" | "lg";
type OverlayBackdrop = "static";
type ScrollScope = "parent" | "body";

type ModalProps = {
  id: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: ModalSize;
  overlayBackdrop?: OverlayBackdrop;
  scrollScope?: ScrollScope;
  isVerticallyCentered?: boolean;
  isKeyActionsEnabled?: boolean;
};

export default function Modal({
  id,
  trigger = <ModalTrigger modalId={id} />,
  children,
  className,
  size = "sm",
  overlayBackdrop,
  scrollScope = "body",
  isVerticallyCentered = false,
  isKeyActionsEnabled = true,
}: ModalProps) {
  return (
    <Fragment>
      {trigger}
      <ModalContent
        id={id}
        className={className}
        size={size}
        overlayBackdrop={overlayBackdrop}
        scrollScope={scrollScope}
        isVerticallyCentered={isVerticallyCentered}
        isKeyActionsEnabled={isKeyActionsEnabled}
      >
        {children}
      </ModalContent>
    </Fragment>
  );
}
