export type CommandGroup = "Theme" | "Navigation" | "Actions";

export type CommandId =
  | "theme-light"
  | "theme-dark"
  | "theme-system"
  | "toggle-sidebar"
  | "go-home"
  | "log-out"
  | "confetti";

export type KeyboardCommand = {
  id: CommandId;
  label: string;
  group: CommandGroup;
  keywords?: string[];
  chord?: string;
  kbdMac?: string;
  kbdWindows?: string;
};

export const KEYBOARD_COMMANDS: KeyboardCommand[] = [
  {
    id: "theme-light",
    label: "Theme: Light",
    group: "Theme",
    keywords: ["appearance", "mode"],
  },
  {
    id: "theme-dark",
    label: "Theme: Dark",
    group: "Theme",
    keywords: ["appearance", "mode"],
  },
  {
    id: "theme-system",
    label: "Theme: System",
    group: "Theme",
    keywords: ["appearance", "mode", "auto"],
  },
  {
    id: "toggle-sidebar",
    label: "Toggle sidebar",
    group: "Navigation",
    keywords: ["panel", "menu"],
    chord: "$mod+b",
    kbdMac: "⌘B",
    kbdWindows: "Ctrl+B",
  },
  {
    id: "go-home",
    label: "Go to Home",
    group: "Navigation",
    keywords: ["dashboard"],
  },
  {
    id: "log-out",
    label: "Log out",
    group: "Actions",
    keywords: ["sign out", "exit"],
  },
  {
    id: "confetti",
    label: "Confetti",
    group: "Actions",
    keywords: ["celebrate", "party"],
    chord: "$mod+Shift+.",
    kbdMac: "⌘⇧.",
    kbdWindows: "Ctrl+Shift+.",
  },
];

export const KEYBOARD_CHORDS = {
  TOGGLE_PALETTE: "$mod+k",
  OPEN_PALETTE: "/",
  TOGGLE_THEME: "$mod+Shift+l",
  TOGGLE_SIDEBAR: "$mod+b",
  CONFETTI: "$mod+Shift+.",
} as const;

export const COMMAND_GROUPS: CommandGroup[] = [
  "Theme",
  "Navigation",
  "Actions",
];
