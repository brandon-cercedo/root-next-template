"use client";

import dynamic from "next/dynamic";

import { usePreline } from "@/hooks/use-preline";

export const PrelineScriptDynamic = dynamic(() => import("./PrelineScript"), {
  ssr: false,
});

export default function PrelineScript() {
  usePreline();
  return null;
}
