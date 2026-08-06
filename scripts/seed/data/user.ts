type SeedUser = {
  name: string;
  email: string;
  emailVerified: Date;
  image?: string;
  rawPassword: string;
};

export const SEED_USERS: { users: SeedUser[] } = {
  users: [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      emailVerified: new Date(),
      rawPassword: "password123",
    },
    {
      name: "Brandon Cercedo",
      email: "marloncercedo@gmail.com",
      emailVerified: new Date(),
      image:
        "https://lh3.googleusercontent.com/a/ACg8ocJtKD3HYbmkBpYnH-ACNodCSQsbHeuODUIMnqdwGbtmN4Eoa1l3=s96-c",
      rawPassword: "password123",
    },
  ],
};
