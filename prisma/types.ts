import type { ChatUIMessage } from "@/types/chat";

declare global {
  namespace PrismaJson {
    type UserPreferences = {
      loginConfettiSeenAt?: string;
    };

    type ChatUIMessageType = ChatUIMessage;
  }
}

export {};
