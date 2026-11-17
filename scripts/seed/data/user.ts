import { envs } from "@/lib/config/envs";

type SeedUser = {
  name: string;
  email: string;
  emailVerified: Date;
  image?: string;
  rawPassword: string;
};

function getDevelopmentUser(): SeedUser {
  if (!envs.SEED_USER_EMAIL || !envs.SEED_USER_PASSWORD) {
    throw new Error("[getDevelopmentUser] Missing user email or password");
  }

  return {
    name: "John Doe",
    email: envs.SEED_USER_EMAIL,
    emailVerified: new Date(),
    rawPassword: envs.SEED_USER_PASSWORD,
  };
}

export const SEED_USERS: { users: SeedUser[] } = {
  users: [
    getDevelopmentUser(),
    {
      name: "Brandon Cercedo",
      email: "marloncercedo@gmail.com",
      emailVerified: new Date(),
      image:
        "https://lh3.googleusercontent.com/a/ACg8ocJtKD3HYbmkBpYnH-ACNodCSQsbHeuODUIMnqdwGbtmN4Eoa1l3=s96-c",
      rawPassword: "root@123",
    },
  ],
};
