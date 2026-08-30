"use client";

import { LucideSearch, LucideSearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Fragment } from "react/jsx-runtime";

import { deleteFlagOverrides, updateFlagOverrides } from "@/actions/flags";
import MessageWithImage from "@/components/ui/MessageWithImage";
import Switch from "@/components/ui/Switch";
import {
  FLAG_DECLARATIONS,
  PartialFlagOverrides,
  type FlagKey,
  type FlagOverrides,
} from "@/lib/flags/config";

import SpinnerIcon from "../ui/spinners/SpinnerIcon";

function composeFlagOverrides({
  overrides = {},
  formState,
  values,
}: {
  overrides?: PartialFlagOverrides;
  formState: FlagOverrides;
  values: FlagOverrides;
}) {
  const nextOverrides = Object.entries(values).reduce(
    (acc, [index, value]) => {
      const key = index as FlagKey;
      const nextValue = formState[key];
      if (nextValue !== value) {
        acc[key] = nextValue;
      }
      return acc;
    },
    { ...overrides }
  );

  if (Object.keys(nextOverrides).length === 0) {
    return undefined;
  }

  return nextOverrides;
}

function hasFlagOverrides(overrides: PartialFlagOverrides = {}) {
  return Object.keys(overrides).length > 0;
}

function FlagDeclaration({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] leading-5 font-medium text-gray-800 dark:text-neutral-200">
          {title}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </span>
      </div>
      <Switch
        size="xs"
        checked={checked}
        disabled={disabled}
        ariaLabel={title}
        onChange={onChange}
      />
    </div>
  );
}

export default function FlagToolbarContent({
  values,
  overrides,
}: {
  values: FlagOverrides;
  overrides: PartialFlagOverrides | undefined;
}) {
  const [searchText, setSearchText] = useState("");
  const [isApplying, startApplyTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [formState, setFormState] = useState<FlagOverrides>(values);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormState(values);
  }, [values]);

  const filteredFlags = useMemo(() => {
    const validSearchText = searchText.trim().toLowerCase();
    if (!validSearchText) {
      return FLAG_DECLARATIONS;
    }

    return FLAG_DECLARATIONS.filter((declaration) => {
      const targetText = `${declaration.key} ${declaration.description}`;
      return targetText.toLowerCase().includes(validSearchText);
    });
  }, [searchText]);

  const hasOverrides = hasFlagOverrides(overrides);

  const nextOverrides = composeFlagOverrides({
    overrides,
    values,
    formState,
  });

  const handleChange = (key: FlagKey, value: boolean) => {
    setFormState((current) => {
      return {
        ...current,
        [key]: value,
      };
    });
  };

  const onApply = () => {
    if (!nextOverrides) {
      return;
    }

    startApplyTransition(async () => {
      await updateFlagOverrides(nextOverrides);
      router.refresh();
    });
  };

  const onClear = () => {
    startDeleteTransition(async () => {
      await deleteFlagOverrides();
      router.refresh();
    });
  };

  return (
    <Fragment>
      <div className="space-y-0.5 px-3 py-2 dark:border-gray-700">
        <span className="text-sm leading-5 font-medium text-gray-800 dark:text-gray-200">
          Flag Explorer
        </span>
      </div>
      <div className="space-y-0.5 p-1">
        <div className="px-2 py-1">
          <div className="relative">
            <input
              type="text"
              className="block w-full rounded-lg border-gray-200 px-3 py-1.5 ps-9.5 text-[13px] leading-5 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              placeholder="Search flags..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 z-20 flex items-center ps-3">
              <LucideSearch className="size-3.5 flex-none text-gray-400 dark:text-neutral-600" />
            </div>
          </div>
        </div>

        {filteredFlags.length === 0 && searchText.trim() && (
          <MessageWithImage
            title="No matching flags"
            image={
              <LucideSearchX
                className="size-10 flex-none text-gray-500 dark:text-neutral-400"
                strokeWidth={1}
              />
            }
            className="gap-2 px-2 py-3"
            titleClassName="text-[13px] leading-5 font-medium text-gray-500 dark:text-gray-400"
          />
        )}

        {filteredFlags.map((flag) => (
          <FlagDeclaration
            key={flag.key}
            title={flag.key}
            description={flag.description}
            checked={formState[flag.key]}
            disabled={isApplying || isDeleting}
            onChange={(value) => {
              handleChange(flag.key, value);
            }}
          />
        ))}
      </div>
      <div className="space-y-0.5 p-1">
        <div className="flex w-full items-center justify-between gap-3 px-2 py-1.5">
          {hasOverrides && (
            <button
              type="button"
              className="flex items-center gap-x-2 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
              disabled={isDeleting}
              onClick={onClear}
            >
              {isDeleting && <SpinnerIcon size="xs" />}
              Clear overwrites
            </button>
          )}
          <button
            type="button"
            className="ms-auto flex items-center gap-x-2 rounded-lg bg-gray-900 px-2 py-1.5 text-[13px] leading-5 text-white hover:bg-gray-800 focus:bg-gray-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus:bg-neutral-100"
            disabled={isApplying || !nextOverrides}
            onClick={onApply}
          >
            {isApplying && <SpinnerIcon size="xs" />}
            Apply
          </button>
        </div>
      </div>
    </Fragment>
  );
}
