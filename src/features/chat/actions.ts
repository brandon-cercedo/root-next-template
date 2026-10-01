"use server";

import { revalidatePath } from "next/cache";

import { getUser, getUserId } from "@/actions/db/user";
import { paths } from "@/lib/config/paths";
import {
  createChatSession,
  deleteAllChatSessions,
  deleteChatSession,
  updateChatSession,
} from "@/services/chat-session";

import {
  CreateChatSessionSchema,
  UpdateChatMessageSchema,
} from "./schema/chat";
import { getLastMessageAt } from "./utils";

import type { ChatSessionStatus } from "@/prisma/types/generated/browser";
import type { ChatUIMessage } from "@/types/chat";

export async function handleCreateChatSession(input: {
  id: string;
  title: string;
  message: ChatUIMessage;
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
  const messages = [data.message as ChatUIMessage];

  try {
    await createChatSession({
      id: data.id,
      title: data.title,
      userId: user.id,
      messages,
      status: "submitted",
      lastMessageAt: getLastMessageAt(messages),
    });
  } catch (error) {
    console.error("[handleCreateChatSession] Failed to create", error);
    return { success: false, message: "Failed to create chat" };
  }

  revalidatePath(paths.dashboard.home(), "layout");

  return { success: true, id: data.id };
}

export async function handleUpdateChatMessage(input: {
  id: string;
  status: ChatSessionStatus;
  messages: ChatUIMessage[];
}) {
  const userId = await getUserId();
  if (!userId) {
    console.error("[handleUpdateChatMessage] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  const parsed = UpdateChatMessageSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[handleUpdateChatMessage] Invalid data", parsed.error);
    return { success: false, message: "Invalid chat message data" };
  }
  const data = parsed.data;
  const messages = data.messages as ChatUIMessage[];

  try {
    await updateChatSession({
      id: data.id,
      userId,
      data: {
        status: data.status,
        messages,
        lastMessageAt: getLastMessageAt(messages),
      },
    });
  } catch (error) {
    console.error("[handleUpdateChatMessage] Failed to update", error);
    return { success: false, message: "Failed to save message" };
  }

  revalidatePath(paths.dashboard.home(), "layout");

  return { success: true };
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

export async function handleDeleteAllChatSessions() {
  const user = await getUser();
  if (!user) {
    console.error("[handleDeleteAllChatSessions] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  try {
    await deleteAllChatSessions(user.id);
  } catch (error) {
    console.error("[handleDeleteAllChatSessions] Failed", error);
    return { success: false, message: "Failed to delete archived chats" };
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

export async function toggleArchivedChatSession({
  id,
  isArchived,
}: {
  id: string;
  isArchived: boolean;
}) {
  const user = await getUser();
  if (!user) {
    console.error("[toggleArchivedChatSession] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  try {
    await updateChatSession({
      id,
      userId: user.id,
      data: {
        isArchived,
        archivedAt: isArchived ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("[toggleArchivedChatSession] Failed to update", error);
    return { success: false, message: "Failed to update archive" };
  }

  revalidatePath(paths.dashboard.home(), "layout");

  return { success: true };
}
