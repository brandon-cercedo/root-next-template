import "server-only";

import prisma from "@/lib/prisma-client";
import { Prisma } from "@/prisma/types/client";

export async function getChatSession(id: string) {
  return prisma.chatSession.findUnique({
    where: { id },
  });
}

export async function listChatSessions(userId: string) {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateChatSession({
  id,
  userId,
  data,
}: {
  id: string;
  userId: string;
  data: Prisma.ChatSessionUpdateInput;
}) {
  const chat = await prisma.chatSession.findUnique({
    where: { id, userId },
    select: { id: true },
  });
  if (!chat) {
    throw new Error(`[updateChatSession] Chat session not found: ${id}`);
  }

  return prisma.chatSession.update({
    where: { id: chat.id },
    data,
  });
}
