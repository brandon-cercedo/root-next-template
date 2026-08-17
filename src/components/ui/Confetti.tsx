"use client";

import { useConfetti, type UseConfettiOptions } from "@/hooks/use-confetti";

export default function Confetti(props: UseConfettiOptions) {
  useConfetti(props);
  return null;
}
