import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function mergeClsx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
