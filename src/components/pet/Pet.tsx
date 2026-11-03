"use client";

import { Mascot } from "page-mascot";

import { DEFAULT_PET_KIND, type PetKind, type PetStyle } from "./config";

type PetProps = {
  pet?: PetKind;
  size?: number;
  style?: PetStyle;
  className?: string;
};

/**
 * Cursor-tracking pet built on `page-mascot`.
 *
 * @see {@link https://koboyo.com/page-mascot | page-mascot} for characters, styles and customization.
 */
export default function Pet({
  pet = DEFAULT_PET_KIND,
  size = 64,
  style = "default",
  className,
}: PetProps) {
  return (
    <Mascot
      directions={`/mascots/${pet}-${style}-directions.webp`}
      reactions={`/mascots/${pet}-${style}-reactions.webp`}
      label={pet}
      size={size}
      className={className}
    />
  );
}
