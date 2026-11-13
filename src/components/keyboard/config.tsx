import {
  Home,
  Keyboard,
  LogOut,
  LucideArchive,
  LucideRotateCcw,
  LucideStar,
  LucideStarOff,
  LucideTrash2,
  MessageCirclePlus,
  Monitor,
  Moon,
  PanelLeft,
  PanelRight,
  PartyPopper,
  Sun,
  ToggleLeft,
} from "lucide-react";

import type { ReactNode } from "react";

export const COMMAND_GROUPS = [
  "Agent",
  "Theme",
  "Navigation",
  "Actions",
  "Admin",
] as const;

export type CommandGroup = (typeof COMMAND_GROUPS)[number];

export const COMMAND_IDS = [
  "toggle-palette",
  "open-palette",
  "toggle-theme",
  "theme-light",
  "theme-dark",
  "theme-system",
  "toggle-sidebar",
  "go-home",
  "new-chat",
  "toggle-chat-offcanvas",
  "log-out",
  "confetti",
  "open-flag-toolbar",
  "open-keyboard-help",
  "move-chat-to-sidebar",
  "favorite-chat",
  "unfavorite-chat",
  "archive-chat",
  "restore-chat",
  "delete-chat",
] as const;

export type CommandId = (typeof COMMAND_IDS)[number];

export type Shortcut = {
  chord: string; // e.g. "$mod+k"
  labels: {
    mac: string[]; // e.g. ["⌘", "K"]
    windows: string[]; // e.g. ["Ctrl", "K"]
  };
};

export type BaseKeyboardCommand = {
  id: CommandId;
  label: string;
  group: CommandGroup;
  keywords?: string[];
  shortcut?: Shortcut;
  inPalette?: boolean;
  inAgent?: boolean;
  inEditable?: boolean; // also run the shortcut inside editable targets
  icon?: ReactNode;
};

export type KeyboardCommand = BaseKeyboardCommand & {
  run: () => void;
};

export const BASE_KEYBOARD_COMMANDS: BaseKeyboardCommand[] = [
  {
    id: "toggle-palette",
    label: "Toggle command palette",
    group: "Navigation",
    shortcut: {
      chord: "$mod+k",
      labels: { mac: ["⌘", "K"], windows: ["Ctrl", "K"] },
    },
    inPalette: false,
    inEditable: true,
  },
  {
    id: "open-palette",
    label: "Open command palette",
    group: "Navigation",
    shortcut: {
      chord: "/",
      labels: { mac: ["/"], windows: ["/"] },
    },
    inPalette: false,
  },
  {
    id: "toggle-theme",
    label: "Toggle theme",
    group: "Theme",
    keywords: ["appearance", "mode"],
    shortcut: {
      chord: "$mod+Shift+,",
      labels: {
        mac: ["⌘", "⇧", ","],
        windows: ["Ctrl", "Shift", ","],
      },
    },
    inPalette: false,
  },
  {
    id: "theme-light",
    label: "Theme: Light",
    group: "Theme",
    keywords: ["appearance", "mode"],
    icon: <Sun className="size-4 flex-none" />,
  },
  {
    id: "theme-dark",
    label: "Theme: Dark",
    group: "Theme",
    keywords: ["appearance", "mode"],
    icon: <Moon className="size-4 flex-none" />,
  },
  {
    id: "theme-system",
    label: "Theme: System",
    group: "Theme",
    keywords: ["appearance", "mode", "auto"],
    icon: <Monitor className="size-4 flex-none" />,
  },
  {
    id: "toggle-sidebar",
    label: "Toggle sidebar",
    group: "Navigation",
    keywords: ["panel", "menu"],
    shortcut: {
      chord: "$mod+b",
      labels: { mac: ["⌘", "B"], windows: ["Ctrl", "B"] },
    },
    icon: <PanelLeft className="size-4 flex-none" />,
  },
  {
    id: "open-keyboard-help",
    label: "Keyboard shortcuts",
    group: "Navigation",
    keywords: ["help", "shortcuts", "keys", "bindings"],
    shortcut: {
      chord: "$mod+/",
      labels: { mac: ["⌘", "/"], windows: ["Ctrl", "/"] },
    },
    inPalette: true,
    icon: <Keyboard className="size-4 flex-none" />,
  },
  {
    id: "go-home",
    label: "Go to Home",
    group: "Navigation",
    keywords: ["dashboard"],
    icon: <Home className="size-4 flex-none" />,
  },
  {
    id: "move-chat-to-sidebar",
    label: "Move to sidebar",
    group: "Agent",
    keywords: ["chat", "panel", "offcanvas"],
    inAgent: false,
    icon: <PanelRight className="size-4 flex-none" />,
  },
  {
    id: "favorite-chat",
    label: "Add to favorites",
    group: "Agent",
    keywords: ["chat", "star"],
    inAgent: false,
    icon: <LucideStar className="size-4 flex-none" />,
  },
  {
    id: "unfavorite-chat",
    label: "Remove from favorites",
    group: "Agent",
    keywords: ["chat", "star"],
    inAgent: false,
    icon: <LucideStarOff className="size-4 flex-none" />,
  },
  {
    id: "archive-chat",
    label: "Archive chat",
    group: "Agent",
    keywords: ["chat"],
    inAgent: false,
    icon: <LucideArchive className="size-4 flex-none" />,
  },
  {
    id: "restore-chat",
    label: "Restore chat",
    group: "Agent",
    keywords: ["chat", "unarchive"],
    inAgent: false,
    icon: <LucideRotateCcw className="size-4 flex-none" />,
  },
  {
    id: "delete-chat",
    label: "Delete chat",
    group: "Agent",
    keywords: ["chat", "remove"],
    inAgent: false,
    icon: <LucideTrash2 className="size-4 flex-none" />,
  },
  {
    id: "new-chat",
    label: "New chat",
    group: "Agent",
    keywords: ["chat", "conversation", "message", "start"],
    shortcut: {
      chord: "$mod+Shift+o",
      labels: {
        mac: ["⌘", "⇧", "O"],
        windows: ["Ctrl", "Shift", "O"],
      },
    },
    inEditable: true,
    icon: <MessageCirclePlus className="size-4 flex-none" />,
  },
  {
    id: "toggle-chat-offcanvas",
    label: "Toggle chat sidebar",
    group: "Agent",
    keywords: ["chat", "panel", "sidebar"],
    shortcut: {
      chord: "$mod+j",
      labels: { mac: ["⌘", "J"], windows: ["Ctrl", "J"] },
    },
    inEditable: true,
    icon: <PanelRight className="size-4 flex-none" />,
  },
  {
    id: "log-out",
    label: "Log out",
    group: "Actions",
    keywords: ["sign out", "exit"],
    icon: <LogOut className="size-4 flex-none" />,
  },
  {
    id: "confetti",
    label: "Confetti",
    group: "Actions",
    keywords: ["celebrate", "party"],
    shortcut: {
      chord: "$mod+Shift+.",
      labels: {
        mac: ["⌘", "⇧", "."],
        windows: ["Ctrl", "Shift", "."],
      },
    },
    icon: <PartyPopper className="size-4 flex-none" />,
  },
  {
    id: "open-flag-toolbar",
    label: "Open flag toolbar",
    group: "Admin",
    keywords: ["flags", "feature", "debug"],
    shortcut: {
      chord: "$mod+Shift+/",
      labels: {
        mac: ["⌘", "⇧", "/"],
        windows: ["Ctrl", "Shift", "/"],
      },
    },
    icon: (
      <ToggleLeft className="size-4 flex-none text-indigo-600 dark:text-indigo-500" />
    ),
  },
];

export type CommandActions = Partial<Record<CommandId, () => void>>;

export type ShortcutCommand = KeyboardCommand & {
  shortcut: Shortcut;
};
