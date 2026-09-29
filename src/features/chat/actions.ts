"use server";

import { generateId } from "ai";
import { revalidatePath } from "next/cache";

import { getUser } from "@/actions/db/user";
import { paths } from "@/lib/config/paths";
import {
  createChatSession,
  deleteChatSession,
  updateChatSession,
} from "@/services/chat-session";

import { CreateChatSessionSchema } from "./schema/chat";

export async function handleCreateChatSession(input: {
  id: string;
  title: string;
  text: string;
}) {
  const user = await getUser();
  if (!user) {
    console.error("[handleCreateChatSession] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  const parsed = CreateChatSessionSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[handleCreateChatSession] Invalid data", parsed.error);
    return { success: false, message: "Invalid chat session data" };
  }
  const data = parsed.data;

  const userMessage: PrismaJson.ChatUIMessageType = {
    id: generateId(),
    role: "user",
    parts: [{ type: "text", text: data.text }],
    metadata: { timestamp: new Date().toISOString() },
  };

  try {
    await createChatSession({
      id: data.id,
      title: data.title,
      userId: user.id,
      messages: [userMessage],
      status: "ready",
    });
  } catch (error) {
    console.error("[handleCreateChatSession] Failed to create", error);
    return { success: false, message: "Failed to create chat" };
  }

  revalidatePath(paths.dashboard.home(), "layout");

  return { success: true, id: data.id };
}

export async function handleDeleteChatSession({ id }: { id: string }) {
  const user = await getUser();
  if (!user) {
    console.error("[handleDeleteChatSession] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  try {
    await deleteChatSession({ id, userId: user.id });
  } catch (error) {
    console.error("[handleDeleteChatSession] Failed to delete", error);
    return { success: false, message: "Failed to delete chat" };
  }

  revalidatePath(paths.dashboard.home(), "layout");

  return { success: true };
}

export async function toggleFavoriteChatSession({
  id,
  isFavourite,
}: {
  id: string;
  isFavourite: boolean;
}) {
  const user = await getUser();
  if (!user) {
    console.error("[toggleFavoriteChatSession] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  try {
    await updateChatSession({
      id,
      userId: user.id,
      data: { isFavourite },
    });
  } catch (error) {
    console.error("[toggleFavoriteChatSession] Failed to update", error);
    return { success: false, message: "Failed to update favorite" };
  }

  revalidatePath(paths.dashboard.home(), "layout");

  return { success: true };
}
