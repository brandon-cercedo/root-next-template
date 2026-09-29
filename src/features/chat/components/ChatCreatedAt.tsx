"use client";

import moment from "moment";

import { ChatSession } from "@/prisma/types/generated/browser";

export default function ChatCreatedAt({ chat }: { chat?: ChatSession }) {
  if (!chat) {
    return null;
  }

  return (
    <div className="py-2.5 text-center text-xs text-gray-500 select-none dark:text-neutral-400">
      {moment(chat.createdAt).format("MMM D [at] h:mm A")}
    </div>
  );
}
