"use client";

import { createContext, useContext, ReactNode } from "react";

import { FullUser } from "@/actions/db/user";

type UserContextType = {
  user: FullUser;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  user,
  children,
}: {
  user: FullUser;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
