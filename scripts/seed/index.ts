import { envs } from "@/lib/config/envs";
import prisma from "@/lib/prisma-client";

async function populateDatabase() {
  console.log("2. Populating database...");
}

async function resetDatabase() {
  console.log("1. Cleaning up existing data...");
  await prisma.$transaction([]);
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
