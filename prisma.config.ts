import { defineConfig } from "prisma/config";

import { envs } from "./src/lib/config/envs";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx scripts/seed/index.ts",
  },
  datasource: {
    url: envs.DATABASE_URL,
    shadowDatabaseUrl: envs.SHADOW_DATABASE_URL,
  },
});
