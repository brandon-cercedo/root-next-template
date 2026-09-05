"use client";

import clsx from "clsx";
import { Check, LucideClipboard } from "lucide-react";
import { useEffect, useState } from "react";

import { mergeClsx } from "@/lib/utils/styles";

type ClipboardSize = "xs" | "sm" | "md" | "lg";

const CLIPBOARD_SIZES: Record<
  ClipboardSize,
  { button: string; icon: string }
> = {
  xs: { button: "size-5", icon: "size-3" },
  sm: { button: "size-6", icon: "size-3.5" },
  md: { button: "size-7", icon: "size-4" },
  lg: { button: "size-8", icon: "size-5" },
};

const SUCCESS_DURATION_MS = 2000;

type ClipboardProps = {
  text: string;
  size?: ClipboardSize;
  className?: string;
  onCopy?: () => void;
};

export default function Clipboard({
  text,
  size = "sm",
  className,
  onCopy,
}: ClipboardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const sizing = CLIPBOARD_SIZES[size];

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const id = setTimeout(() => {
      setIsCopied(false);
    }, SUCCESS_DURATION_MS);

    return () => {
      clearTimeout(id);
    };
  }, [isCopied]);

  async function handleCopy() {
    if (isCopied) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    setIsCopied(true);
    onCopy?.();
  }

  return (
    <button
      type="button"
      aria-label={isCopied ? "Copied" : "Copy"}
      disabled={isCopied}
      onClick={handleCopy}
      className={mergeClsx(
        "inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
        sizing.button,
        className
      )}
    >
      {isCopied ? (
        <Check
          className={clsx("text-blue-600 dark:text-blue-500", sizing.icon)}
        />
      ) : (
        <LucideClipboard className={sizing.icon} />
      )}
    </button>
  );
}
