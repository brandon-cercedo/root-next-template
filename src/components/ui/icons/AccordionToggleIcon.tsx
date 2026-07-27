import { LucideChevronDown, LucideChevronUp } from "lucide-react";
import { Fragment } from "react";

import { mergeClsx } from "@/lib/utils/styles";

import { IconProps } from "./types";

export default function AccordionToggleIcon({ className, size }: IconProps) {
  return (
    <Fragment>
      <LucideChevronDown
        className={mergeClsx(
          "block size-4 flex-none text-gray-600 dark:text-neutral-400 hs-accordion-active:hidden",
          className
        )}
        size={size}
      />
      <LucideChevronUp
        className={mergeClsx(
          "hidden size-4 flex-none text-gray-600 dark:text-neutral-400 hs-accordion-active:block",
          className
        )}
        size={size}
      />
    </Fragment>
  );
}
