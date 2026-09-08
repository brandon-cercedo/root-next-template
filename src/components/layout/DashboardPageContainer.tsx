import { mergeClsx } from "@/lib/utils/styles";

type DashboardPageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * @note `*:flex-1` fills `min-h-full` on short contents; content can still grow taller.
 */
export default function DashboardPageContainer({
  children,
  className,
}: DashboardPageContainerProps) {
  return (
    <main className="size-full overflow-y-auto [&::-webkit-scrollbar]:size-0">
      <div
        className={mergeClsx(
          "flex min-h-full w-full flex-col gap-4 p-4 pb-16 *:flex-1",
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
