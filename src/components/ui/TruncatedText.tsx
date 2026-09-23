"use client";

import { truncate } from "lodash";

import Tooltip, { TooltipPlacement } from "./Tooltip";

interface TruncatedTextProps {
  text: string | null | undefined;
  chars: number;
  className?: string;
  omission?: string;
  placement?: TooltipPlacement;
}

export default function TruncatedText({
  text,
  chars,
  className,
  omission = "...",
  placement = "top",
}: TruncatedTextProps) {
  if (!text) {
    return null;
  }

  const truncatedText = truncate(text, { length: chars, omission });
  const isTruncated = truncatedText !== text;

  if (!isTruncated) {
    return <span className={className}>{text}</span>;
  }

  return (
    <Tooltip content={text} placement={placement}>
      <span className={className}>{truncatedText}</span>
    </Tooltip>
  );
}
