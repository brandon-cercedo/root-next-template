"use client";

import { mergeClsx } from "@/lib/utils/styles";

type SwitchSize = "xs" | "sm" | "md" | "lg";

const SWITCH_SIZES: Record<SwitchSize, { track: string; thumb: string }> = {
  xs: { track: "h-5 w-9", thumb: "size-4" },
  sm: { track: "h-6 w-11", thumb: "size-5" },
  md: { track: "h-7 w-13", thumb: "size-6" },
  lg: { track: "h-8 w-15", thumb: "size-7" },
};

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: SwitchSize;
  disabled?: boolean;
  name?: string;
  className?: string;
  ariaLabel?: string;
};

export default function Switch({
  checked,
  onChange,
  size = "md",
  disabled = false,
  name,
  className,
  ariaLabel,
}: SwitchProps) {
  const sizing = SWITCH_SIZES[size];

  return (
    <label
      className={mergeClsx(
        "relative inline-block shrink-0 cursor-pointer",
        sizing.track,
        {
          "cursor-not-allowed": disabled,
        },
        className
      )}
    >
      <input
        name={name}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 peer-focus-visible:ring-offset-2 peer-disabled:pointer-events-none peer-disabled:opacity-50 dark:bg-neutral-700 dark:peer-checked:bg-blue-500" />
      <span
        className={mergeClsx(
          "absolute inset-s-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out peer-checked:translate-x-full",
          sizing.thumb
        )}
      />
    </label>
  );
}
