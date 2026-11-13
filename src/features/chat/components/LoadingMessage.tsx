"use client";

import { type ChatStatus } from "ai";
import { LucideBot } from "lucide-react";

import { isChatWorking } from "@/lib/utils/db/chat";

const LABELS: Partial<Record<ChatStatus, string>> = {
  submitted: "Thinking...",
  streaming: "Working...",
};

type LoadingMessageProps = {
  status: ChatStatus;
};

export default function LoadingMessage({ status }: LoadingMessageProps) {
  if (!isChatWorking(status)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-500">
      <LucideBot className="size-3.5 flex-none animate-bounce text-gray-900 dark:text-white" />
      <span>{LABELS[status]}</span>
    </div>
  );
}
