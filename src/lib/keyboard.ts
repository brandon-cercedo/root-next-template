import {
  BASE_KEYBOARD_COMMANDS,
  CommandActions,
  KeyboardCommand,
  Shortcut,
  ShortcutCommand,
} from "@/components/keyboard/config";
import { isMac } from "@/lib/utils/html";

export function getShortcutKeys({ labels }: Shortcut) {
  return isMac() ? labels.mac : labels.windows;
}

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

export function getShortcutCommands(commands: KeyboardCommand[]) {
  return commands.filter((command): command is ShortcutCommand =>
    Boolean(command.shortcut)
  );
}
