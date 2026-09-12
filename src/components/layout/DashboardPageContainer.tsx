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
    <main
      className={mergeClsx(
        "flex min-h-0 flex-1 flex-col gap-4 p-4 pb-16 lg:flex-row",
        className
      )}
    >
      {children}
    </main>
  );
}
