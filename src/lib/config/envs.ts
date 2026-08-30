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
    FLAGS_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
    NEXT_PUBLIC_APP_VERSION: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FLAGS_SECRET: process.env.FLAGS_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  },
  emptyStringAsUndefined: true,
  // prisma generate / postinstall may load prisma.config without .env.local
  skipValidation:
    process.env.npm_lifecycle_event === "postinstall" ||
    !!process.env.SKIP_ENV_VALIDATION,
});

export type Environment = "development" | "preview" | "production";

function getEnvironment(): Environment {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === "production") {
    return "production";
  }

  if (vercelEnv === "preview") {
    return "preview";
  }

  if (vercelEnv === "development") {
    return "development";
  }

  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function isProduction() {
  return getEnvironment() === "production";
}

export function isPreview() {
  return getEnvironment() === "preview";
}

export function isDevelopment() {
  return getEnvironment() === "development";
}
