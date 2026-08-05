import bcrypt from "bcryptjs";

import { envs } from "@/lib/config/envs";
import prisma from "@/lib/prisma-client";

import { SEED_USERS } from "./data/user";

async function populateDatabase() {
  console.log("2. Populating database...");
  const { users } = SEED_USERS;

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.rawPassword, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        password: hashedPassword,
      },
    });
  }
}

async function resetDatabase() {
  console.log("1. Cleaning up existing data...");
  await prisma.$transaction([prisma.user.deleteMany()]);
}

function isDBProduction() {
  const { DATABASE_URL, SHADOW_DATABASE_URL } = envs;

  if (
    DATABASE_URL?.includes("localhost") &&
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
