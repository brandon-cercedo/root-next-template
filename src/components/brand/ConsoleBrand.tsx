"use client";

import { useEffect } from "react";

import { logConsoleBrand } from "@/lib/console-brand";

export default function ConsoleBrand() {
  useEffect(() => {
    logConsoleBrand();
  }, []);

  return null;
}
