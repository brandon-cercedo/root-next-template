export function ThemeSelectorLoading() {
  return (
    <div className="inline-flex animate-pulse items-center rounded-full bg-gray-50 p-0.5 dark:bg-neutral-700">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="flex size-7 items-center justify-center rounded-full"
        >
          <div className="size-3.5 flex-none rounded-full bg-gray-200 dark:bg-neutral-600" />
        </div>
      ))}
    </div>
  );
}

export function ThemeToggleLoading() {
  return (
    <div className="flex animate-pulse items-center justify-center rounded-full p-2 transition-colors">
      <div className="size-5 flex-none rounded-full bg-gray-200 dark:bg-neutral-700" />
    </div>
  );
}
