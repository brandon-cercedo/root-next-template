import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { Account, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { CredentialsSchema } from "@/features/auth/schema";
import { envs } from "@/lib/config/envs";
import { paths } from "@/lib/config/paths";
import prisma from "@/lib/prisma-client";

async function handleGoogleSignIn(email: string, account: Account) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });
  if (!existingUser) {
    console.error("[signIn] User not found");
    return paths.auth.error("AccessDenied");
  }

  // Link Google account to user if it comes from Credentials provider
  const googleAccount = existingUser.accounts.find(
    (acc) => acc.provider === "google"
  );
  if (!googleAccount) {
    await prisma.account.create({
      data: {
        userId: existingUser.id,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
      },
    });
  }

  return true;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: paths.auth.signIn(),
    signOut: paths.auth.signOut(),
    error: paths.auth.error("FailedToSignIn"),
  },
  providers: [
    GoogleProvider({
      clientId: envs.GOOGLE_CLIENT_ID,
      clientSecret: envs.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = CredentialsSchema.safeParse(credentials);
        if (!result.success) {
          return null;
        }

        const { email, password } = result.data;
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    // User object is not created yet in this callback.
    async signIn({ user, account }) {
      if (!user.email) {
        console.error("[signIn] Invalid user email");
        return false;
      }
      if (!account) {
        console.error("[signIn] Invalid account");
        return false;
      }

      if (account.provider === "google") {
        return await handleGoogleSignIn(user.email, account);
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        token.user = { id: user.id };
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user.id = token.user.id;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
