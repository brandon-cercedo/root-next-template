import { z } from "zod";

const EnvironmentSchema = z
  .object({
    DATABASE_URL: z.url(),
    SHADOW_DATABASE_URL: z.url().optional(),
  })
  .partial(); // Only `NEXT_PUBLIC_*` envs are available in the client.

export const envs = EnvironmentSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
});
