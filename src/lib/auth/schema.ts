import { z } from "zod";

export const CredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
