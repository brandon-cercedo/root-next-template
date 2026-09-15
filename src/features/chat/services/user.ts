import "server-only";

import prisma from "@/lib/prisma-client";

export async function getCurrentUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      accounts: {
        select: {
          type: true,
          provider: true,
        },
      },
    },
  });
}
