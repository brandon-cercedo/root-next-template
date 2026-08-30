import { decryptOverrides } from "flags";
import { evaluate } from "flags/next";
import { cookies } from "next/headers";

import { clientDebugFlag, serverDebugFlag } from "@/lib/flags";
import {
  FLAG_OVERRIDE_COOKIE_NAME,
  type FlagOverrides,
  type PartialFlagOverrides,
} from "@/lib/flags/config";
import { sanitizeFlagOverrides } from "@/lib/flags/utils";

export async function getFlagValues() {
  const [isClientDebug, isServerDebug] = await evaluate([
    clientDebugFlag,
    serverDebugFlag,
  ]);

  const values: FlagOverrides = {
    "client-debug": isClientDebug,
    "server-debug": isServerDebug,
  };

  return values;
}

export async function getFlagOverrides(): Promise<
  PartialFlagOverrides | undefined
> {
  const cookieStore = await cookies();
  const encryptedData = cookieStore.get(FLAG_OVERRIDE_COOKIE_NAME)?.value;
  if (!encryptedData) {
    return;
  }

  try {
    const data = await decryptOverrides(encryptedData);
    if (!data) {
      return;
    }

    const overrides = sanitizeFlagOverrides(data);
    const isServerDebug = await serverDebugFlag();
    if (isServerDebug) {
      console.log(
        "🐛 [getFlagOverrides] > overrides:",
        JSON.stringify(overrides)
      );
    }

    return overrides;
  } catch {
    return;
  }
}
