"use client";

import {
  LucideBraces,
  LucideCode,
  LucideGrid2x2,
  LucideLightbulb,
  LucideLink,
  LucidePanelLeft,
  LucidePartyPopper,
  LucidePawPrint,
  LucideSunMoon,
  LucideUserRound,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Fragment, useState } from "react";

import { CommandId } from "@/components/keyboard/config";
import KbdList from "@/components/keyboard/Kbd";
import Dropdown from "@/components/ui/Dropdown";
import DropdownToggleIcon from "@/components/ui/icons/DropdownToggleIcon";
import { useKeyboard } from "@/hooks/use-keyboard";
import { getShortcutKeys } from "@/lib/keyboard";

import { LoadingSuggestedPrompts } from "./loading";

type SuggestedPrompt = {
  text: string;
  icon: LucideIcon;
  commandId?: CommandId;
};

type SuggestedPromptGroup = {
  label: string;
  prompts: SuggestedPrompt[];
};

const SUGGESTED_PROMPT_GROUPS: SuggestedPromptGroup[] = [
  {
    label: "Coding",
    prompts: [
      { text: "Explain useEffect cleanup", icon: LucideCode },
      { text: "Write a debounce in TypeScript", icon: LucideBraces },
    ],
  },
  {
    label: "Account",
    prompts: [
      { text: "What's on my profile?", icon: LucideUserRound },
      { text: "Which accounts are linked?", icon: LucideLink },
    ],
  },
  {
    label: "Actions",
    prompts: [
      {
        text: "Toggle the theme",
        icon: LucideSunMoon,
        commandId: "toggle-theme",
      },
      {
        text: "Toggle the sidebar",
        icon: LucidePanelLeft,
        commandId: "toggle-sidebar",
      },
      {
        text: "Celebrate with confetti",
        icon: LucidePartyPopper,
        commandId: "confetti",
      },
    ],
  },
  {
    label: "Pet",
    prompts: [
      { text: "Show me the fox", icon: LucidePawPrint },
      { text: "Show the fox in pixel art", icon: LucideGrid2x2 },
    ],
  },
];

const SUGGESTED_PROMPT_LABELS = [
  "Need some ideas?",
  "See what I can do",
  "Not sure where to start?",
  "Try a suggested prompt",
];

function getPromptLabel() {
  const index = Math.floor(Math.random() * SUGGESTED_PROMPT_LABELS.length);
  return SUGGESTED_PROMPT_LABELS[index];
}

type PromptItemProps = {
  prompt: SuggestedPrompt;
  onSelect: (text: string) => void;
};

function PromptItem({ prompt, onSelect }: PromptItemProps) {
  const { shortcutsById } = useKeyboard();

  const command = prompt.commandId && shortcutsById.get(prompt.commandId);
  const Icon = prompt.icon;

  return (
    <button
      type="button"
      className="flex w-full items-center gap-x-3 rounded-lg px-2 py-1.5 text-[13px] leading-5 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700"
      onClick={() => onSelect(prompt.text)}
    >
      <Icon className="size-4 flex-none" />
      {prompt.text}
      {command && (
        <KbdList
          keys={getShortcutKeys(command.shortcut)}
          size="xs"
          containerClassName="ms-auto"
        />
      )}
    </button>
  );
}

type ContentProps = {
  onSelect: (text: string) => void;
};

function Content({ onSelect }: ContentProps) {
  return (
    <Fragment>
      {SUGGESTED_PROMPT_GROUPS.map((group) => (
        <div key={group.label} className="w-full space-y-0.5 p-1">
          <span className="block px-2 py-1.5 text-[10px] font-medium text-gray-500 uppercase dark:text-neutral-500">
            {group.label}
          </span>
          {group.prompts.map((prompt) => (
            <PromptItem
              key={prompt.text}
              prompt={prompt}
              onSelect={onSelect}
            />
          ))}
        </div>
      ))}
    </Fragment>
  );
}

export const SuggestedPromptsDynamic = dynamic(
  () => import("./SuggestedPrompts"),
  {
    ssr: false,
    loading: () => <LoadingSuggestedPrompts />,
  }
);

type SuggestedPromptsProps = {
  disabled?: boolean;
  onSelect: (text: string) => Promise<void>;
};

export default function SuggestedPrompts({
  disabled = false,
  onSelect,
}: SuggestedPromptsProps) {
  const [label] = useState(getPromptLabel);

  const handleSelect = (text: string) => {
    onSelect(text).catch(() => undefined);
  };

  return (
    <Dropdown
      content={<Content onSelect={handleSelect} />}
      className="z-60 w-xs max-w-xs"
      placement="bottom-left"
    >
      <button
        type="button"
        disabled={disabled}
        className="inline-flex items-center gap-x-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus:bg-gray-50 focus:text-gray-800 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus:bg-neutral-800 dark:focus:text-neutral-200 hs-dropdown-open:bg-gray-50 hs-dropdown-open:text-gray-800 dark:hs-dropdown-open:bg-neutral-800 dark:hs-dropdown-open:text-neutral-200"
      >
        <LucideLightbulb className="size-3.5 flex-none text-yellow-500" />
        {label}
        <DropdownToggleIcon />
      </button>
    </Dropdown>
  );
}
