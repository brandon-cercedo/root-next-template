"use client";

import { LucidePlus } from "lucide-react";
import Link from "next/link";

import { paths } from "@/lib/config/paths";
import { mergeClsx } from "@/lib/utils/styles";

type ChatCreateButtonProps = {
  className?: string;
};

export default function ChatCreateButton({
  className,
}: ChatCreateButtonProps) {
  return (
    <Link
      href={paths.dashboard.chats()}
      className={mergeClsx(
        "inline-flex size-5 flex-none items-center justify-center gap-1 rounded-md bg-transparent text-[13px] leading-5 text-gray-600 shadow-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:bg-transparent dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 dark:focus:bg-neutral-700 dark:focus:text-neutral-200",
        className
      )}
      aria-label="New chat"
    >
      <LucidePlus className="size-4 flex-none" />
    </Link>
  );
}
