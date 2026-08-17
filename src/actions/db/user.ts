"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma-client";
import { User, UserSetting } from "@/prisma/types/client";

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getUser() {
  const userId = await getSessionUserId();
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

export type FullUser = User & {
  setting: UserSetting | null;
};

export async function getFullUser(): Promise<FullUser | null> {
  const userId = await getSessionUserId();
  if (!userId) {
    console.error("[getFullUser] No user found");
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      setting: true,
    },
  });

  if (!user) {
    console.error("[getFullUser] No user found");
    return null;
  }

  if (!user.setting) {
    console.error("[getFullUser] Missing UserSetting");
  }

  return {
    ...user,
    password: null,
  };
}

export async function markLoginConfettiSeen() {
  const userId = await getSessionUserId();
  if (!userId) {
    return;
  }

  const setting = await prisma.userSetting.findUnique({
    where: { userId },
  });

  if (!setting) {
    console.error("[markLoginConfettiSeen] Missing UserSetting");
    return;
  }

  const preferences = setting.preferences ?? {};
  if (preferences.loginConfettiSeenAt) {
    return;
  }

  await prisma.userSetting.update({
    where: { userId },
    data: {
      preferences: {
        ...preferences,
        loginConfettiSeenAt: new Date().toISOString(),
      },
    },
  });
}
