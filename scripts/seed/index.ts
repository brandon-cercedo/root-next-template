import bcrypt from "bcryptjs";
import { chunk } from "lodash";
import { v7 as uuidv7 } from "uuid";

import { envs } from "@/lib/config/envs";
import prisma from "@/lib/prisma-client";

import { SEED_CHAT_SESSIONS } from "./data/chat-session";
import { SEED_USERS } from "./data/user";

async function createChatSessions(userId: string) {
  for (const sessions of chunk(SEED_CHAT_SESSIONS.sessions, 10)) {
    const promises = sessions.map((session) =>
      prisma.chatSession.create({
        data: {
          id: uuidv7(),
          title: session.title,
          status: session.status,
          messages: session.messages,
          userId,
        },
      })
    );
    await Promise.all(promises);
  }
}

async function populateDatabase() {
  console.log("2. Populating database...");
  const { users } = SEED_USERS;

  for (const user of users) {
    // Create user
    const hashedPassword = await bcrypt.hash(user.rawPassword, 10);
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        password: hashedPassword,
        setting: {
          create: { preferences: {} },
        },
      },
    });

    // Create chat sessions
    await createChatSessions(createdUser.id);
  }
}

async function resetDatabase() {
  console.log("1. Cleaning up existing data...");
  await prisma.$transaction([
    prisma.chatSession.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

function isDBProduction() {
  const { DATABASE_URL, SHADOW_DATABASE_URL } = envs;

  if (
    DATABASE_URL.includes("localhost") &&
    SHADOW_DATABASE_URL?.includes("localhost")
  ) {
    return false;
  }

  return true;
}

async function main() {
  if (isDBProduction()) {
    throw new Error("❌ Skipping. Trying to seed PROD database.");
  }

  console.log("🌱 Seeding database...");
  await resetDatabase();
  await populateDatabase();
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
