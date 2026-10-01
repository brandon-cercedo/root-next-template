import { LucideSearch } from "lucide-react";

import { mergeClsx } from "@/lib/utils/styles";

import type { ComponentProps } from "react";

type SearchInputProps = ComponentProps<"input">;

export default function SearchInput({
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        className={mergeClsx(
          "block w-full rounded-lg border-gray-200 px-3 py-1.5 ps-9.5 text-[13px] leading-5 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600",
          className
        )}
        {...props}
      />
      <div className="pointer-events-none absolute inset-y-0 inset-s-0 z-20 flex items-center ps-3">
        <LucideSearch className="size-3.5 flex-none text-gray-400 dark:text-neutral-600" />
      </div>
    </div>
  );
}
