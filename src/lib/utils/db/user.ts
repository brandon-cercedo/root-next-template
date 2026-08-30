import { isDevelopment } from "@/lib/config/envs";
import { User } from "@/prisma/types/client";

export function composeUserDisplayName(user: User) {
  const name = user.name?.trim();
  if (name) {
    return name.split(" ")[0];
  }

  const email = user.email.trim();
  const [username] = email.split("@");

  return `@${username.toLowerCase()}`;
}

const ADMIN_EMAILS = ["john.doe@example.com", "marloncercedo@gmail.com"];

export function isAdmin(user: Pick<User, "email">) {
  if (isDevelopment()) {
    return true;
  }

  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
