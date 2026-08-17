"use client";

import { markLoginConfettiSeen } from "@/actions/db/user";
import Confetti from "@/components/ui/Confetti";
import { useUser } from "@/hooks/use-user";

export default function FirstLoginConfetti() {
  const { user } = useUser();
  const seenAt = user.setting?.preferences.loginConfettiSeenAt;

  return (
    <Confetti
      fire={!seenAt}
      onFired={() => {
        void markLoginConfettiSeen();
      }}
    />
  );
}
