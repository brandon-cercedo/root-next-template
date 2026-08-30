"use client";

import { mergeClsx } from "@/lib/utils/styles";

import type { KeyboardEvent } from "react";

export type DropdownPlacement =
  | "auto"
  | "auto-start"
  | "auto-end"
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "right"
  | "right-start"
  | "right-end"
  | "left"
  | "left-start"
  | "left-end";

export type DropdownTrigger = "click" | "hover" | "contextmenu";

export type DropdownScope = "window" | "parent";

export type DropdownAutoClose = "inside" | "outside" | "true" | "false";

interface DropdownProps {
  id?: string;
  content: React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  placement?: DropdownPlacement;
  trigger?: DropdownTrigger;
  scope?: DropdownScope;
  autoClose?: DropdownAutoClose;
  offset?: number;
  isKeyActionsEnabled?: boolean;
}

export default function Dropdown({
  id,
  content,
  children,
  containerClassName,
  className,
  placement,
  trigger,
  scope,
  autoClose,
  offset,
  isKeyActionsEnabled = true,
}: DropdownProps) {
  const handleKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    if (isKeyActionsEnabled) {
      return;
    }
    event.stopPropagation();
  };

  return (
    <div
      id={id}
      className={mergeClsx(
        "hs-dropdown relative inline-flex",
        {
          "[--placement:auto]": placement === "auto",
          "[--placement:auto-start]": placement === "auto-start",
          "[--placement:auto-end]": placement === "auto-end",
          "[--placement:top]": placement === "top",
          "[--placement:top-left]": placement === "top-left",
          "[--placement:top-right]": placement === "top-right",
          "[--placement:bottom]": placement === "bottom",
          "[--placement:bottom-left]": placement === "bottom-left",
          "[--placement:bottom-right]": placement === "bottom-right",
          "[--placement:right]": placement === "right",
          "[--placement:right-start]": placement === "right-start",
          "[--placement:right-end]": placement === "right-end",
          "[--placement:left]": placement === "left",
          "[--placement:left-start]": placement === "left-start",
          "[--placement:left-end]": placement === "left-end",
          "[--trigger:click]": trigger === "click",
          "[--trigger:hover]": trigger === "hover",
          "[--trigger:contextmenu]": trigger === "contextmenu",
          "[--scope:window]": scope === "window",
          "[--scope:parent]": scope === "parent",
          "[--auto-close:inside]": autoClose === "inside",
          "[--auto-close:outside]": autoClose === "outside",
          "[--auto-close:true]": autoClose === "true",
          "[--auto-close:false]": autoClose === "false",
        },
        offset && `[--offset:${offset}]`,
        containerClassName
      )}
    >
      <div
        className="hs-dropdown-toggle flex w-full items-center"
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="Dropdown"
      >
        {children}
      </div>
      <div
        className={mergeClsx(
          "hs-dropdown-menu duration mt-2 hidden max-w-60 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white opacity-0 shadow-md transition-[opacity,margin] before:absolute before:inset-s-0 before:-top-4 before:h-4 before:w-full after:absolute after:inset-s-0 after:-bottom-4 after:h-4 after:w-full dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 hs-dropdown-open:opacity-100",
          className
        )}
        role="menu"
        aria-orientation="vertical"
        onKeyDownCapture={handleKeyDownCapture}
      >
        {content}
      </div>
    </div>
  );
}
