import { truncate } from "lodash";

import { TITLE_MAX_LENGTH } from "@/features/chat/schema/chat";

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
