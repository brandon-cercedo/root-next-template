import { mergeClsx } from "@/lib/utils/styles";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <main
      className={mergeClsx(
        "mx-auto flex size-full min-h-screen max-w-3xl flex-col",
        className
      )}
    >
      {children}
    </main>
  );
}
