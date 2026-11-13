import { LucideChevronDown } from "lucide-react";

import { mergeClsx } from "@/lib/utils/styles";

import { IconProps } from "./types";

export default function DropdownToggleIcon({ className, size }: IconProps) {
  return (
    <LucideChevronDown
      className={mergeClsx(
        "size-3.5 flex-none text-gray-600 transition-transform duration-150 dark:text-neutral-400 hs-dropdown-open:rotate-180",
        className
      )}
      size={size}
    />
  );
}
