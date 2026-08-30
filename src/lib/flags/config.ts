import type { FlagDeclaration } from "flags";

export type FlagKey = "client-debug" | "server-debug";

export type FlagOverrides = Record<FlagKey, boolean>;

export type PartialFlagOverrides = Partial<FlagOverrides>;

export const FLAG_OVERRIDE_COOKIE_NAME = "vercel-flag-overrides";
export const FLAG_OVERRIDE_COOKIE_PATH = "/";

type InternalFlagDeclaration = FlagDeclaration<boolean, unknown> & {
  key: FlagKey;
  description: string;
};

/**
 * Application's flag declarations with additional properties.
 *
 * @note Right now we are using only boolean values, but we can extend this to
 * other types in the future.
 */
export const FLAG_DECLARATIONS: InternalFlagDeclaration[] = [
  {
    key: "client-debug",
    description: "Debug mode will be activated and dev UI will be available.",
    options: [
      { value: false, label: "Off" },
      { value: true, label: "On" },
    ],
    decide() {
      return false;
    },
  },
  {
    key: "server-debug",
    description:
      "Debug mode will be activated and dev actions will be available.",
    options: [
      { value: false, label: "Off" },
      { value: true, label: "On" },
    ],
    decide() {
      return false;
    },
  },
];

export const FLAG_DECLARATIONS_MAP = new Map<FlagKey, InternalFlagDeclaration>(
  FLAG_DECLARATIONS.map((declaration) => [declaration.key, declaration])
);
