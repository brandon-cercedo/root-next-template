"use client";

import { mergeClsx } from "@/lib/utils/styles";

const KBD_WRAPPER_SIZES = {
  xs: "gap-x-1 text-[11px]",
  sm: "gap-x-1 text-xs",
  md: "gap-x-1.5 text-sm",
  lg: "gap-x-1.5 text-base",
};

const KBD_CHIP_SIZES = {
  xs: "h-5 min-w-5 p-0.5 text-[11px]",
  sm: "h-6 min-w-6 p-1 text-xs",
  md: "h-7.5 min-w-7.5 p-1 text-sm",
  lg: "h-8 min-w-8 p-1 text-base",
};

type KbdSize = keyof typeof KBD_WRAPPER_SIZES;

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
        "inline-flex flex-none items-center justify-center rounded-md border border-gray-200 bg-white font-mono text-gray-800 select-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white",
        KBD_CHIP_SIZES[size],
        className
      )}
    >
      {label}
    </kbd>
  );
}

type KbdListProps = {
  keys: string[];
  size?: KbdSize;
  containerClassName?: string;
  className?: string;
};

export default function KbdList({
  keys,
  size = "sm",
  containerClassName,
  className,
}: KbdListProps) {
  if (keys.length === 0) {
    return null;
  }

  return (
    <span
      className={mergeClsx(
        "flex flex-none flex-nowrap items-center text-gray-600 dark:text-neutral-300",
        KBD_WRAPPER_SIZES[size],
        containerClassName
      )}
    >
      {keys.map((key, index) => (
        <Kbd
          key={`${key}-${index}`}
          label={key}
          size={size}
          className={className}
        />
      ))}
    </span>
  );
}
