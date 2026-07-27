import { Inter } from "next/font/google";

import { PrelineScriptDynamic } from "@/components/preline/PrelineScript";

import type { Metadata } from "next";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Root",
    default: "Root",
  },
  description: "Base template to build Next.js applications.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Root",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} hs-overlay-body-open bg-white antialiased transition-colors dark:bg-neutral-900`}
      >
        {children}
        <PrelineScriptDynamic />
      </body>
    </html>
  );
}
