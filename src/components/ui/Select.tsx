import { LucideCheck, LucideChevronsUpDown } from "lucide-react";
import { useId } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { mergeClsx } from "@/lib/utils/styles";

type SelectSize = "xs" | "sm" | "md";

type SelectSizing = {
  toggle: string;
  chevron: string;
  option: string;
  check: string;
};

const SELECT_SIZES: Record<SelectSize, SelectSizing> = {
  xs: {
    toggle: "py-1.5 ps-2.5 pe-7 text-xs h-7.5",
    chevron: "size-3",
    option: "py-1.5 px-2.5 text-xs",
    check: "size-3",
  },
  sm: {
    toggle: "py-2 ps-3 pe-8 text-sm h-9.5",
    chevron: "size-3.5",
    option: "py-1.5 px-3 text-sm",
    check: "size-3.5",
  },
  md: {
    toggle: "py-3 ps-4 pe-9 text-sm h-11.5",
    chevron: "size-3.5",
    option: "py-2 px-4 text-sm",
    check: "size-3.5",
  },
};

function SelectOptionTemplate({ iconClassName }: { iconClassName: string }) {
  return (
    <div className="flex w-full items-center justify-between">
      <span data-title="" />
      <span className="hidden hs-selected:block">
        <LucideCheck
          className={mergeClsx(
            "flex-none text-blue-600 dark:text-blue-500",
            iconClassName
          )}
        />
      </span>
    </div>
  );
}

function SelectChevronMarkup({ iconClassName }: { iconClassName: string }) {
  return (
    <div className="absolute inset-e-3 top-1/2 -translate-y-1/2">
      <LucideChevronsUpDown
        className={mergeClsx(
          "flex-none text-gray-500 dark:text-neutral-400",
          iconClassName
        )}
      />
    </div>
  );
}

function SelectLoading({ sizing }: { sizing: SelectSizing }) {
  return (
    <div
      aria-hidden
      className={mergeClsx(
        "relative flex w-full animate-pulse items-center rounded-lg border border-gray-200 group-has-[.hs-select]:hidden dark:border-neutral-700",
        sizing.toggle
      )}
    >
      <div className="h-full w-2/3 rounded-md bg-gray-200 dark:bg-neutral-700" />
      <div
        className={mergeClsx(
          "absolute inset-e-3 top-1/2 -translate-y-1/2 rounded bg-gray-200 dark:bg-neutral-700",
          sizing.chevron
        )}
      />
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id?: string;
  name?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  size?: SelectSize;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function Select({
  id,
  name,
  options,
  onChange,
  placeholder = "Select option...",
  containerClassName,
  size = "md",
  disabled = false,
  ariaLabel,
}: SelectProps) {
  const reactId = useId();
  const selectId = id ?? `select-${reactId.replaceAll(":", "")}`;
  const sizing = SELECT_SIZES[size];

  const config = {
    placeholder,
    toggleTag: '<button type="button" aria-expanded="false"></button>',
    toggleClasses: mergeClsx(
      "relative flex w-full cursor-pointer rounded-lg border border-gray-200 bg-white text-start text-nowrap text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50",
      sizing.toggle
    ),
    dropdownClasses:
      "mt-2 z-50 w-full max-h-72 space-y-0.5 overflow-hidden overflow-y-auto rounded-lg border border-transparent bg-white p-1 shadow-xl focus:outline-hidden dark:bg-neutral-900 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500",
    optionClasses: mergeClsx(
      "w-full cursor-pointer rounded-lg text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 hs-selected:bg-gray-100 dark:hs-selected:bg-neutral-800 hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50",
      sizing.option
    ),
    optionTemplate: renderToStaticMarkup(
      <SelectOptionTemplate iconClassName={sizing.check} />
    ),
    extraMarkup: renderToStaticMarkup(
      <SelectChevronMarkup iconClassName={sizing.chevron} />
    ),
  };

  return (
    <div className={mergeClsx("group relative", containerClassName)}>
      <SelectLoading sizing={sizing} />
      <select
        id={selectId}
        name={name}
        className="hidden"
        data-hs-select={JSON.stringify(config)}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
