"use client";

import HomeView from "@/features/home/components/HomeView";
import { useUser } from "@/hooks/use-user";

export default function Home() {
  const { user } = useUser();

  return <HomeView user={user} />;
}
