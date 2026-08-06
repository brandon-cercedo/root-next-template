import { User } from "../../../../prisma/types/generated/client";

export function composeUserDisplayName(user: User) {
  const name = user.name?.trim();
  if (name) {
    return name.split(" ")[0];
  }

  const email = user.email.trim();
  const [username] = email.split("@");

  return `@${username.toLowerCase()}`;
}
