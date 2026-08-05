"use client";

import Image from "next/image";

import { mergeClsx } from "@/lib/utils/styles";

export default function AppLogoIcon({ className }: { className?: string }) {
  return (
    <div className="flex flex-none items-center focus:opacity-80 focus:outline-hidden">
      <Image
        src="/icon-light.svg"
        alt="Root"
        width={28}
        height={28}
        className={mergeClsx("block size-7 dark:hidden", className)}
      />
      <Image
        src="/icon-dark.svg"
        alt="Root"
        width={28}
        height={28}
        className={mergeClsx("hidden size-7 dark:block", className)}
      />
    </div>
  );
}
