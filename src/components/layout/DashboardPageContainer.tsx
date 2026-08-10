import { mergeClsx } from "@/lib/utils/styles";

type DashboardPageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function DashboardPageContainer({
  children,
  className,
}: DashboardPageContainerProps) {
  return (
    <main className={mergeClsx("flex flex-1 gap-4 p-4 pb-16", className)}>
      {children}
    </main>
  );
}
