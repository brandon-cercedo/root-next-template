import { mergeClsx } from "@/lib/utils/styles";

const SPINNER_SIZES = {
  xs: "size-3 border-2",
  sm: "size-4 border-2",
  md: "size-6 border-[2.5px]",
  lg: "size-8 border-[2.5px]",
};

export default function SpinnerIcon({
  size = "md",
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={mergeClsx(
        "inline-block flex-none animate-spin rounded-full border-current border-t-transparent",
        SPINNER_SIZES[size],
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
