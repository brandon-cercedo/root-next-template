"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { paths } from "@/lib/config/paths";
import prisma from "@/lib/prisma-client";
import { User, UserSetting } from "@/prisma/types/client";

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

export type FullUser = User & {
  setting: UserSetting | null;
};

export async function getFullUser(): Promise<FullUser | null> {
  const user = await getUser();
  if (!user) {
    console.error("[getFullUser] No user found");
    return null;
  }

  // Fetch extra data
  const [setting] = await Promise.all([
    prisma.userSetting.findUnique({ where: { userId: user.id } }),
  ]);

  // Prepare payload
  const fullUser: FullUser = {
    ...user,
    password: null,
    setting,
  };

  return fullUser;
}

export async function completeLoginConfetti() {
  const user = await getUser();
  if (!user) {
    console.error("[completeLoginConfetti] User not authenticated");
    return;
  }

  const setting = await prisma.userSetting.findUnique({
    where: { userId: user.id },
  });
  if (!setting) {
    throw new Error("[completeLoginConfetti] Missing UserSetting");
  }

  const preferences = setting.preferences ?? {};
  if (preferences.loginConfettiSeenAt) {
    return;
  }

  await prisma.userSetting.update({
    where: { userId: user.id },
    data: {
      preferences: {
        ...preferences,
        loginConfettiSeenAt: new Date().toISOString(),
      },
    },
  });

  revalidatePath(paths.dashboard.home());
}
