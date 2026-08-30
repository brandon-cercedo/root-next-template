import { Flag, flag } from "flags/next";

import { FLAG_DECLARATIONS_MAP, type FlagKey } from "@/lib/flags/config";

function createFlag(key: FlagKey): Flag<boolean, unknown> {
  const declaration = FLAG_DECLARATIONS_MAP.get(key);
  if (!declaration) {
    throw new Error(`[createFlag] Flag declaration not found for key: ${key}`);
  }
  return flag(declaration);
}

export const clientDebugFlag = createFlag("client-debug");
export const serverDebugFlag = createFlag("server-debug");
