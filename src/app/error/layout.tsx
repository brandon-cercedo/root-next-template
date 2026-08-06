import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error",
};

export default async function ErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
