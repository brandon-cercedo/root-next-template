import "server-only";

import { tool } from "ai";

import {
  BASE_KEYBOARD_COMMANDS,
  CommandId,
} from "@/components/keyboard/config";
import {
  createKeyboardCommandInputSchema,
  UserProfileInputSchema,
} from "@/features/chat/schema/tools";
import { getCurrentUserProfile } from "@/features/chat/services/user";

function createRunKeyboardCommandTool(
  keyboardCommandIds: Partial<CommandId[]>
) {
  const commands = BASE_KEYBOARD_COMMANDS.filter((command) => {
    return keyboardCommandIds.includes(command.id);
  });
  if (commands.length === 0) {
    return undefined;
  }

  const commandIds = commands.map((command) => command.id);
  const data = commands.map(({ id, label, group, shortcut }) => ({
    id,
    label,
    group,
    ...(shortcut ? { shortcut: { labels: shortcut.labels } } : {}),
  }));

  return tool({
    description: `Run a UI keyboard command when the user wants an in-app action (theme, navigation, shortcuts, and similar).

Rules:
- Client-executed; no server side effects.
- Only ids from the current client registry are valid.
- When listing or describing commands, share full details from the catalog (label, group, shortcuts).
- Keep command ids internal: use them only in tool calls — never show or mention ids to the user.

Available commands:
\`\`\`json
${JSON.stringify(data)}
\`\`\`
`,
    inputSchema: createKeyboardCommandInputSchema(commandIds),
  });
}

type CreateChatToolsOptions = {
  userId: string;
  keyboardCommandIds: Partial<CommandId[]>;
};

export function createChatTools({
  userId,
  keyboardCommandIds,
}: CreateChatToolsOptions) {
  const runKeyboardCommand = createRunKeyboardCommandTool(keyboardCommandIds);

  return {
    getCurrentUser: tool({
      description: `Return the signed-in user's profile when they ask about their account or identity (name, email, image, timestamps, linked accounts).

Rules:
- Include a field ONLY IF its value is present and non-empty. Treat null, undefined, "", and [] as absent.
- DO NOT add any sentence, note, or aside referencing a field that was excluded — act as if excluded fields don't exist in the schema at all.
- Format timestamps as human-readable dates.`,
      inputSchema: UserProfileInputSchema,
      execute: async () => {
        const profile = await getCurrentUserProfile(userId);
        if (!profile) {
          return { success: false, error: "User not found" };
        }
        return {
          ...profile,
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
        };
      },
    }),
    ...(runKeyboardCommand ? { runKeyboardCommand } : {}),
  };
}
