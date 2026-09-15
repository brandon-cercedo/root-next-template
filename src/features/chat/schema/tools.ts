import { z } from "zod";

import { type CommandId } from "@/components/keyboard/config";

export const UserProfileInputSchema = z.object({});

export type KeyboardCommandInput = {
  commandId: CommandId;
};

export function createKeyboardCommandInputSchema(commandIds: CommandId[]) {
  return z.object({
    commandId: z.enum(commandIds),
  });
}
