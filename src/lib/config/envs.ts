import { z } from "zod";

const EnvironmentSchema = z
  .object({
    DATABASE_URL: z.url(),
    SHADOW_DATABASE_URL: z.url().optional(),
    NEXTAUTH_URL: z.url().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    NEXT_PUBLIC_BASE_URL: z.url(),
  })
  .partial(); // Only `NEXT_PUBLIC_*` envs are available in the client.

export const envs = EnvironmentSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
});
