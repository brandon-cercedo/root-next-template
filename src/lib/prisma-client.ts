import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/prisma/types/client";

import { envs } from "./config/envs";

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  connectionString: envs.DATABASE_URL,
});

/**
 * @see {@link https://www.prisma.io/docs/guides/nextjs | Next.js}
 */
const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
