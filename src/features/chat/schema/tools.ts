import { z } from "zod";

import { type CommandId } from "@/components/keyboard/config";
import {
  PET_KINDS,
  PET_SIZE_MAX,
  PET_SIZE_MIN,
  PET_STYLES,
} from "@/components/pet/config";

export const UserProfileInputSchema = z.object({});

export type KeyboardCommandInput = {
  commandId: CommandId;
};

export function createKeyboardCommandInputSchema(commandIds: CommandId[]) {
  return z.object({
    commandId: z.enum(commandIds),
  });
}

export const ShowPetInputSchema = z.object({
  pet: z.enum(PET_KINDS).optional(),
  style: z.enum(PET_STYLES).optional(),
  size: z.number().int().min(PET_SIZE_MIN).max(PET_SIZE_MAX).optional(),
});

export type ShowPetInput = z.infer<typeof ShowPetInputSchema>;
