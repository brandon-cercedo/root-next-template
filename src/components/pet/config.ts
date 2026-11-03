export const PET_KINDS = ["fox", "owl"] as const;
export const PET_STYLES = ["default", "riso", "paper", "pixel"] as const;
export const DEFAULT_PET_KIND: PetKind = "fox";
export const PET_SIZE_MIN = 32;
export const PET_SIZE_MAX = 160;

export type PetKind = (typeof PET_KINDS)[number];

export type PetStyle = (typeof PET_STYLES)[number];
