"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

import SignOutView from "@/features/auth/components/SignOutView";
import { paths } from "@/lib/config/paths";

export default function SignOutPage() {
  useEffect(() => {
    const handleSignOut = async () => {
      await signOut({
        callbackUrl: paths.auth.signIn(),
      });
    };
    handleSignOut();
  }, []);

  return <SignOutView />;
}
