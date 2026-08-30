import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge multiple class values into a single string of classes.
 *
 * @note Last class value takes precedence.
 */
export function mergeClsx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
