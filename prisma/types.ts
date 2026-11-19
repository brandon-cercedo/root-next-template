import type { ChatUIMessage } from "@/types/chat";

declare global {
  namespace PrismaJson {
    type UserPreferences = {
      loginConfettiSeenAt?: string;
    };

    type ChatUIMessageType = ChatUIMessage;

    type ChatSessionAction = {
      lastMessageId: string; // last message kept; later ones were deleted
      timestamp: string; // ISO
    };

    type ChatSessionActions = {
      fork?: ChatSessionAction & { parentId: string };
      edit?: ChatSessionAction;
      retry?: ChatSessionAction;
    };
  }
}

export {};
