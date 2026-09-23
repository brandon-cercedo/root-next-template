"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma-client";
import { ChatSession, User, UserSetting } from "@/prisma/types/client";
import { listChatSessions } from "@/services/chat-session";

export async function getUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

export async function getUserId() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}

export type FullUser = User & {
  setting: UserSetting | null;
  chatSessions: ChatSession[];
};

export async function getFullUser(): Promise<FullUser | null> {
  const user = await getUser();
  if (!user) {
    console.error("[getFullUser] No user found");
    return null;
  }

  // Fetch extra data
  const [setting, chatSessions] = await Promise.all([
    prisma.userSetting.findUnique({ where: { userId: user.id } }),
    listChatSessions(user.id),
  ]);

  // Prepare payload
  const fullUser: FullUser = {
    ...user,
    password: null,
    setting,
    chatSessions,
  };

  return fullUser;
}
