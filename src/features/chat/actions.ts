"use server";

import { generateId } from "ai";
import { revalidatePath } from "next/cache";

import { getUser } from "@/actions/db/user";
import { paths } from "@/lib/config/paths";
import prisma from "@/lib/prisma-client";

import { CreateChatSessionSchema } from "./schema/chat";

export async function createChatSession(input: {
  id: string;
  title: string;
  text: string;
}) {
  const user = await getUser();
  if (!user) {
    console.error("[createChatSession] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  const parsed = CreateChatSessionSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[createChatSession] Invalid data", parsed.error);
    return { success: false, message: "Invalid chat session data" };
  }
  const data = parsed.data;

  const userMessage: PrismaJson.ChatUIMessageType = {
    id: generateId(),
    role: "user",
    parts: [{ type: "text", text: data.text }],
    metadata: { timestamp: new Date().toISOString() },
  };

  const chat = await prisma.chatSession.create({
    data: {
      id: data.id,
      title: data.title,
      userId: user.id,
      messages: [userMessage],
      status: "ready",
    },
  });
  revalidatePath(paths.dashboard.chat(chat.id));

  return { success: true, id: chat.id };
}
