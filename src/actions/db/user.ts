"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma-client";

import { User } from "../../../prisma/types/generated/client";

export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  return user;
}

export type FullUser = User;

export async function getFullUser(): Promise<FullUser | null> {
  const user = await getUser();
  if (!user) {
    console.error("[getFullUser] No user found");
    return null;
  }

  const fullUser: FullUser = {
    ...user,
  };

  return fullUser;
}
