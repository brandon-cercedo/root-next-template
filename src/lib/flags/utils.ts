import {
  FLAG_DECLARATIONS_MAP,
  FlagKey,
  type PartialFlagOverrides,
} from "@/lib/flags/config";

export function sanitizeFlagOverrides(overrides: PartialFlagOverrides) {
  return Object.entries(overrides).reduce<PartialFlagOverrides>(
    (acc, [id, value]) => {
      const key = id as FlagKey;

      if (FLAG_DECLARATIONS_MAP.has(key)) {
        acc[key] = value === true;
      }

      return acc;
    },
    {}
  );
}
