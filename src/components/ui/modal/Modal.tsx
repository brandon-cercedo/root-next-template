"use client";

import { LucideX } from "lucide-react";
import { Fragment, KeyboardEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ModalProvider } from "@/hooks/use-modal";
import { mergeClsx } from "@/lib/utils/styles";

import ModalCloseButton from "./ModalCloseButton";
import ModalTrigger from "./ModalTrigger";

export const OVERLAY_BACKDROP_CLASS =
  "hs-overlay-backdrop transition duration fixed inset-0 bg-black/25 dark:bg-black/40";

function fixOverlayOptions(options?: OverlayOptions) {
  return {
    backdropClasses: OVERLAY_BACKDROP_CLASS,
    ...options,
  };
}

export type OverlayOptions = {
  isClosePrev?: boolean;
  backdropClasses?: string;
  backdropExtraClasses?: string;
};

type ModalTransition = "fade" | "scale" | "slide-down" | "slide-up" | "none";

interface ModalContentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  rootClassName?: string;
  size?: ModalSize;
  overlayBackdrop?: OverlayBackdrop;
  overlayOptions?: OverlayOptions;
  autoFocus?: boolean;
  scrollScope?: ScrollScope;
  transition?: ModalTransition;
  isVerticallyCentered?: boolean;
  isKeyActionsEnabled?: boolean;
  isEscapeCloseEnabled?: boolean;
  showCloseButton?: boolean;
}

function ModalContent({
  id,
  children,
  className,
  containerClassName,
  rootClassName,
  size = "sm",
  overlayBackdrop,
  overlayOptions,
  autoFocus = true,
  scrollScope = "body",
  transition = "slide-down",
  isVerticallyCentered = false,
  isKeyActionsEnabled = true,
  isEscapeCloseEnabled = true,
  showCloseButton = false,
}: ModalContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    if (isKeyActionsEnabled) {
      return;
    }
    event.stopPropagation();
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      id={id}
      className={mergeClsx(
        "hs-overlay pointer-events-none fixed inset-s-0 top-0 z-80 hidden size-full overflow-x-hidden overflow-y-auto",
        {
          "opacity-0 transition-all hs-overlay-open:opacity-100 hs-overlay-open:duration-500":
            transition === "fade",
          "[--overlay-backdrop:static]": overlayBackdrop === "static",
          "[--overlay-backdrop:false]": overlayBackdrop === "false",
          "[--has-autofocus:false]": autoFocus === false,
        },
        rootClassName
      )}
      role="dialog"
      tabIndex={-1}
      data-hs-overlay-keyboard={isEscapeCloseEnabled ? undefined : "false"}
      onKeyDownCapture={handleKeyDownCapture}
      data-hs-overlay-options={JSON.stringify(
        fixOverlayOptions(overlayOptions)
      )}
    >
      <div
        className={mergeClsx(
          "m-3",
          {
            "sm:mx-auto sm:w-full sm:max-w-lg": size === "sm",
            "md:mx-auto md:w-full md:max-w-2xl": size === "md",
            "lg:mx-auto lg:w-full lg:max-w-4xl": size === "lg",
            "flex min-h-[calc(100%-56px)] items-center": isVerticallyCentered,
            "h-[calc(100%-56px)]": scrollScope === "parent",
            "hs-overlay-animation-target scale-95 opacity-0 transition-all duration-200 ease-in-out hs-overlay-open:scale-100 hs-overlay-open:opacity-100":
              transition === "scale",
            "hs-overlay-animation-target mt-0 opacity-0 transition-all ease-out hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500":
              transition === "slide-down",
            "mt-14 opacity-0 transition-all ease-out hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500":
              transition === "slide-up",
          },
          containerClassName
        )}
      >
        <div
          className={mergeClsx(
            "pointer-events-auto flex w-full flex-col rounded-xl border border-gray-200 bg-white shadow-2xs dark:border-neutral-700 dark:bg-neutral-800",
            {
              "max-h-full overflow-hidden": scrollScope === "parent",
              relative: showCloseButton,
            },
            className
          )}
        >
          <ModalProvider id={id} isMounted={isMounted}>
            {children}
          </ModalProvider>
          {showCloseButton && (
            <ModalCloseButton
              modalId={id}
              className="absolute -top-2.5 -right-2.5 size-5 border-gray-200 bg-white hover:bg-gray-100 focus:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
            >
              <LucideX className="size-3 flex-none" />
            </ModalCloseButton>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

type ModalSize = "sm" | "md" | "lg" | "auto";
export type OverlayBackdrop = "static" | "false";
type ScrollScope = "parent" | "body";

type ModalProps = {
  id: string;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  rootClassName?: string;
  size?: ModalSize;
  overlayBackdrop?: OverlayBackdrop;
  overlayOptions?: OverlayOptions;
  autoFocus?: boolean;
  scrollScope?: ScrollScope;
  transition?: ModalTransition;
  isVerticallyCentered?: boolean;
  isKeyActionsEnabled?: boolean;
  isEscapeCloseEnabled?: boolean;
  showCloseButton?: boolean;
};

export default function Modal({
  id,
  trigger = <ModalTrigger modalId={id} />,
  children,
  className,
  containerClassName,
  rootClassName,
  size = "sm",
  overlayBackdrop,
  overlayOptions,
  autoFocus = true,
  scrollScope = "body",
  transition = "slide-down",
  isVerticallyCentered = false,
  isKeyActionsEnabled = true,
  isEscapeCloseEnabled = true,
  showCloseButton = false,
}: ModalProps) {
  return (
    <Fragment>
      {trigger}
      <ModalContent
        id={id}
        className={className}
        containerClassName={containerClassName}
        rootClassName={rootClassName}
        size={size}
        overlayBackdrop={overlayBackdrop}
        overlayOptions={overlayOptions}
        autoFocus={autoFocus}
        scrollScope={scrollScope}
        transition={transition}
        isVerticallyCentered={isVerticallyCentered}
        isKeyActionsEnabled={isKeyActionsEnabled}
        isEscapeCloseEnabled={isEscapeCloseEnabled}
        showCloseButton={showCloseButton}
      >
        {children}
      </ModalContent>
    </Fragment>
  );
}
