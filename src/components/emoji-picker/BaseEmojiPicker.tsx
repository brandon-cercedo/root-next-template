"use client";

import { Emoji, EmojiPicker } from "frimousse";
import { LucideSearch } from "lucide-react";

import SpinnerIcon from "../ui/spinners/SpinnerIcon";

type BaseEmojiPickerProps = {
  actions?: React.ReactNode;
  columns?: number;
  onSelect?: (emoji: Emoji) => void;
};

export default function BaseEmojiPicker({
  columns = 9,
  actions,
  onSelect,
}: BaseEmojiPickerProps) {
  return (
    <div className="flex max-w-fit flex-col py-1.5">
      <EmojiPicker.Root
        onEmojiSelect={onSelect}
        className="flex flex-col gap-1.5"
        columns={columns}
      >
        <div className="relative px-1.5">
          <EmojiPicker.Search className="block w-full rounded-lg border-gray-200 px-3 py-1.5 ps-[38px] text-[13px] leading-5 focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
          <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3">
            <LucideSearch className="size-3.5 flex-none text-gray-400 dark:text-neutral-600" />
          </div>
        </div>
        <EmojiPicker.Viewport className="flex h-[284px] w-full flex-col gap-1.5 overflow-auto px-1.5">
          <EmojiPicker.Loading className="flex items-center justify-center gap-2 text-[13px] leading-5 text-gray-500 dark:text-neutral-500">
            <SpinnerIcon
              size="sm"
              className="text-blue-600 dark:text-blue-500"
            />
            <span>Loading…</span>
          </EmojiPicker.Loading>
          <EmojiPicker.Empty className="flex items-center justify-center text-[13px] leading-5 text-gray-500 dark:text-neutral-500">
            No emoji found.
          </EmojiPicker.Empty>
          <EmojiPicker.List
            className="select-none"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div
                  className="bg-white px-2 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                  {...props}
                >
                  {category.label}
                </div>
              ),
              Row: ({ children, ...props }) => (
                <div {...props}>{children}</div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button
                  className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-gray-50 dark:data-[active]:bg-neutral-700"
                  {...props}
                >
                  {emoji.emoji}
                </button>
              ),
            }}
          />
        </EmojiPicker.Viewport>
        <hr className="border-gray-200 dark:border-neutral-700" />
        <div
          className="flex items-center justify-between gap-1 px-3.5"
          style={{ maxWidth: `${columns * 32 + 12}px` }}
        >
          <EmojiPicker.ActiveEmoji>
            {({ emoji }) => (
              <div className="w-full max-w-60 text-xs text-gray-800 dark:text-neutral-200">
                {emoji ? (
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{emoji.emoji}</span>
                    <span>{emoji.label}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 select-none dark:text-neutral-500">
                    Select an emoji…
                  </span>
                )}
              </div>
            )}
          </EmojiPicker.ActiveEmoji>
          <div className="flex items-center gap-1">
            {actions}
            <EmojiPicker.SkinToneSelector className="flex size-7 items-center justify-center rounded-lg border border-transparent bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700" />
          </div>
        </div>
      </EmojiPicker.Root>
    </div>
  );
}
