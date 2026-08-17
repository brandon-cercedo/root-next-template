import type { HSDropdown, HSOverlay, IStaticMethods } from "preline";

declare global {
  interface Window {
    // Preline UI
    HSStaticMethods: IStaticMethods;
    HSOverlay: typeof HSOverlay;
    HSDropdown: typeof HSDropdown;
  }
}

export {};
