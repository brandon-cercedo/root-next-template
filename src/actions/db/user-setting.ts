"use server";

import { revalidatePath } from "next/cache";

import { getUser } from "@/actions/db/user";
import { paths } from "@/lib/config/paths";
import prisma from "@/lib/prisma-client";

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
