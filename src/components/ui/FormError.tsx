import { mergeClsx } from "@/lib/utils/styles";

export default function FormError({
  errors,
  id,
  className,
}: {
  errors: string[];
  id?: string;
  className?: string;
}) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <ul
      className={mergeClsx(
        "mt-2 list-inside text-sm text-red-600 dark:text-red-400",
        {
          "list-none": errors.length === 1,
          "list-disc": errors.length > 1,
        },
        className
      )}
      id={id}
    >
      {errors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
}
