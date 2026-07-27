"use client";

import { mergeClsx } from "@/lib/utils/styles";

export type TooltipTrigger = "click" | "focus" | "hover";

export type TooltipPlacement =
  | "auto"
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "right"
  | "right-top"
  | "right-bottom"
  | "left"
  | "left-top"
  | "left-bottom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger;
}

export default function Tooltip({
  content,
  children,
  containerClassName,
  className,
  placement = "top",
  trigger = "hover",
}: TooltipProps) {
  return (
    <div
      className={mergeClsx(
        "hs-tooltip inline-block",
        {
          "[--placement:auto]": placement === "auto",
          "[--placement:top]": placement === "top",
          "[--placement:top-left]": placement === "top-left",
          "[--placement:top-right]": placement === "top-right",
          "[--placement:bottom]": placement === "bottom",
          "[--placement:bottom-left]": placement === "bottom-left",
          "[--placement:bottom-right]": placement === "bottom-right",
          "[--placement:right]": placement === "right",
          "[--placement:right-top]": placement === "right-top",
          "[--placement:right-bottom]": placement === "right-bottom",
          "[--placement:left]": placement === "left",
          "[--placement:left-top]": placement === "left-top",
          "[--placement:left-bottom]": placement === "left-bottom",
          "[--trigger:click]": trigger === "click",
          "[--trigger:focus]": trigger === "focus",
          "[--trigger:hover]": trigger === "hover",
        },
        containerClassName
      )}
    >
      <div
        className={mergeClsx(
          "hs-tooltip-content invisible absolute z-9999 inline-block max-w-3xs rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-2xs transition-opacity dark:bg-neutral-700 hs-tooltip-shown:visible hs-tooltip-shown:opacity-100",
          className
        )}
        role="tooltip"
      >
        {content}
      </div>
      <div className="hs-tooltip-toggle w-full">{children}</div>
    </div>
  );
}
