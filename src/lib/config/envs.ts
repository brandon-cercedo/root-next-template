import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const envs = createEnv({
  server: {
    DATABASE_URL: z.url(),
    SHADOW_DATABASE_URL: z.url().optional(),
    NEXTAUTH_URL: z.url().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  emptyStringAsUndefined: true,
  // prisma generate / postinstall may load prisma.config without .env.local
  skipValidation:
    process.env.npm_lifecycle_event === "postinstall" ||
    !!process.env.SKIP_ENV_VALIDATION,
});
