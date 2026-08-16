"use client";

import { useEffect } from "react";

import { envs } from "@/lib/config/envs";

const DESCRIPTION_STYLE_LIGHT = "color: #171717;";
const DESCRIPTION_STYLE_DARK = "color: #F7F8F8;";
const BRAND_STYLE = [
  "font-family: monospace",
  "background: linear-gradient(to right, #2563eb, #7c3aed)",
  "-webkit-background-clip: text",
  "background-clip: text",
  "color: transparent",
].join("; ");

const MESSAGE = `
%c    ____  ____  ____ ______
   / __ \\/ __ \\/ __ \\__  __/
  / /_/ / / / / / / / / /   
 / _, _/ /_/ / /_/ / / /    
/_/ \\_\\\\____/\\____/ /_/     
%c
🎲 Root Next Template
Base template to build Next.js applications.

Author: https://github.com/brandon-cercedo
Version: v${envs.NEXT_PUBLIC_APP_VERSION}
`.trim();

function getDescriptionStyle(): string {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return DESCRIPTION_STYLE_DARK;
  }
  return DESCRIPTION_STYLE_LIGHT;
}

export function logBrand(): void {
  if (typeof console === "undefined") {
    return;
  }
  console.log(MESSAGE, BRAND_STYLE, getDescriptionStyle());
}

export default function ConsoleBrand() {
  useEffect(() => {
    logBrand();
  }, []);

  return null;
}
