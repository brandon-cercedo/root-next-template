import type { UIMessage } from "ai";

export type ChatMessageMetadata = {
  /** When the message was sent (user) or finished (assistant), ISO. */
  timestamp: string;
  /** Assistant only: ms from user send to stream finish. */
  durationMs?: number;
};

export type ChatUIMessage = UIMessage<ChatMessageMetadata>;
