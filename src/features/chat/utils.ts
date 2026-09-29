import { truncate } from "lodash";

import { TITLE_MAX_LENGTH } from "@/features/chat/schema/chat";

import type { ChatUIMessage } from "@/types/chat";
import type { UIMessage } from "ai";

export function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function getChatTitle(text: string) {
  const [line = ""] = text.split("\n");
  const cleanedLine = line.replace(/\s+/g, " ").trim();

  return truncate(cleanedLine, { length: TITLE_MAX_LENGTH, omission: "" });
}

type ChatCounts = {
  userCount: number;
  assistantCount: number;
  totalDurationMs: number;
  durationsMs: number[];
};

export function getChatStats(chat: { messages: ChatUIMessage[] }) {
  const counts = chat.messages.reduce<ChatCounts>(
    (counts, message) => {
      if (message.role === "user") {
        return { ...counts, userCount: counts.userCount + 1 };
      }

      if (message.role !== "assistant") {
        return counts;
      }

      const durationMs = message.metadata?.durationMs ?? 0;

      return {
        ...counts,
        assistantCount: counts.assistantCount + 1,
        totalDurationMs: counts.totalDurationMs + durationMs,
        durationsMs: [...counts.durationsMs, durationMs],
      };
    },
    { userCount: 0, assistantCount: 0, totalDurationMs: 0, durationsMs: [] }
  );

  const hasReplies = counts.assistantCount > 0;
  const stats = {
    ...counts,
    averageDurationMs: hasReplies
      ? Math.round(counts.totalDurationMs / counts.assistantCount)
      : 0,
    fastestDurationMs: hasReplies ? Math.min(...counts.durationsMs) : 0,
    slowestDurationMs: hasReplies ? Math.max(...counts.durationsMs) : 0,
  };

  return stats;
}
