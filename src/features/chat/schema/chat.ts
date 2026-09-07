import { z } from "zod";

const UIMessagePartSchema = z
  .object({
    type: z.string(),
  })
  .catchall(z.unknown());

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      parts: z.array(UIMessagePartSchema),
    })
  ),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
