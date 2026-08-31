import { isMac } from "@/lib/utils/html";

export const COMMAND_GROUPS = [
  "Theme",
  "Navigation",
  "Actions",
  "Admin",
] as const;

export type CommandGroup = (typeof COMMAND_GROUPS)[number];

export type CommandId =
  | "toggle-palette"
  | "open-palette"
  | "toggle-theme"
  | "theme-light"
  | "theme-dark"
  | "theme-system"
  | "toggle-sidebar"
  | "go-home"
  | "log-out"
  | "confetti"
  | "open-flag-toolbar";

type Shortcut = {
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
};

export type KeyboardCommand = BaseKeyboardCommand & {
  run: () => void;
};

export function getShortcutKeys({ labels }: Shortcut) {
  return isMac() ? labels.mac : labels.windows;
}

const BASE_KEYBOARD_COMMANDS: BaseKeyboardCommand[] = [
  {
    id: "toggle-palette",
    label: "Toggle command palette",
    group: "Navigation",
    shortcut: {
      chord: "$mod+k",
      labels: { mac: ["⌘", "K"], windows: ["Ctrl", "K"] },
    },
    inPalette: false,
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
      chord: "$mod+Shift+l",
      labels: {
        mac: ["⌘", "⇧", "L"],
        windows: ["Ctrl", "Shift", "L"],
      },
    },
    inPalette: false,
  },
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
    shortcut: {
      chord: "$mod+b",
      labels: { mac: ["⌘", "B"], windows: ["Ctrl", "B"] },
    },
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
    shortcut: {
      chord: "$mod+Shift+.",
      labels: {
        mac: ["⌘", "⇧", "."],
        windows: ["Ctrl", "Shift", "."],
      },
    },
  },
  {
    id: "open-flag-toolbar",
    label: "Open flag toolbar",
    group: "Admin",
    keywords: ["flags", "feature", "debug"],
    shortcut: {
      chord: "$mod+Shift+f",
      labels: {
        mac: ["⌘", "⇧", "F"],
        windows: ["Ctrl", "Shift", "F"],
      },
    },
  },
];

export type CommandActions = Partial<Record<CommandId, () => void>>;

export function getKeyboardCommands(actions: CommandActions) {
  return BASE_KEYBOARD_COMMANDS.reduce<KeyboardCommand[]>((acc, item) => {
    const run = actions[item.id];
    if (!run) {
      return acc;
    }

    const command: KeyboardCommand = {
      ...item,
      run,
    };
    acc.push(command);

    return acc;
  }, []);
}

type ShortcutCommand = KeyboardCommand & {
  shortcut: Shortcut;
};

export function getShortcutCommands(commands: KeyboardCommand[]) {
  return commands.filter((command): command is ShortcutCommand =>
    Boolean(command.shortcut)
  );
}
