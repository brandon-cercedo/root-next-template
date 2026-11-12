import type { ChatSessionStatus } from "@/prisma/types/generated/browser";
import type { ChatStatus } from "ai";

export function isChatWorking(status: ChatSessionStatus | ChatStatus) {
  return status === "submitted" || status === "streaming";
}
