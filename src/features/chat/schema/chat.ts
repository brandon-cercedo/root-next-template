import { z } from "zod";

const ChatMessageMetadataSchema = z.object({
  timestamp: z.string(),
  durationMs: z.number().optional(),
});

const UIMessagePartSchema = z
  .object({
    type: z.string(),
  })
  .catchall(z.unknown());

const ChatUIMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(UIMessagePartSchema),
  metadata: ChatMessageMetadataSchema,
});

export const ChatRequestSchema = z.object({
  chatId: z.uuidv7(),
  messages: z.array(ChatUIMessageSchema),
  keyboardCommandIds: z.array(z.string()), // Client registry keys that currently have `run` (allowlisted on server).
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const TITLE_MAX_LENGTH = 60;

export const CreateChatSessionSchema = z.object({
  id: z.uuidv7(),
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
  text: z.string().trim().min(1),
});
