"use client";

import { useUser } from "@/features/auth/components/UserProvider";
import HomeView from "@/features/home/components/HomeView";

export default function Home() {
  const { user } = useUser();

  return <HomeView user={user} />;
}
