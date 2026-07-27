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
    <main className={mergeClsx("flex flex-1 gap-4 p-4 pb-16", className)}>
      {children}
    </main>
  );
}
