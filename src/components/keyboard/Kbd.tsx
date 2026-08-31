"use client";

import { mergeClsx } from "@/lib/utils/styles";

const KBD_WRAPPER_SIZES = {
  xs: "gap-x-0.5 text-[11px]",
  sm: "gap-x-0.5 text-xs",
  md: "gap-x-1 text-sm",
  lg: "gap-x-1 text-base",
};

const KBD_CHIP_SIZES = {
  xs: "size-5 p-0.5 text-[11px]",
  sm: "size-6 p-1 text-xs",
  md: "size-7.5 p-1 text-sm",
  lg: "size-8 p-1 text-base",
};

type KbdSize = keyof typeof KBD_WRAPPER_SIZES;

type KbdListProps = {
  keys: string[];
  size?: KbdSize;
  className?: string;
};

type KbdProps = {
  label: string;
  size?: KbdSize;
  className?: string;
};

export function Kbd({ label, size = "md", className }: KbdProps) {
  return (
    <kbd
      aria-hidden="true"
      className={mergeClsx(
        "inline-flex flex-none items-center justify-center rounded-md border border-gray-200 bg-white font-mono text-gray-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white",
        KBD_CHIP_SIZES[size],
        className
      )}
    >
      {label}
    </kbd>
  );
}

export default function KbdList({
  keys,
  size = "sm",
  className,
}: KbdListProps) {
  if (keys.length === 0) {
    return null;
  }

  return (
    <span
      className={mergeClsx(
        "flex flex-none flex-wrap items-center text-gray-600 dark:text-neutral-300",
        KBD_WRAPPER_SIZES[size],
        className
      )}
    >
      {keys.map((key, index) => (
        <Kbd key={`${key}-${index}`} label={key} size={size} />
      ))}
    </span>
  );
}
