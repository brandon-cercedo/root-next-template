import { useEffect, useState } from "react";

/**
 * Debounce a value for a given delay.
 *
 * @param value - The value to debounce.
 * @param delay - The delay in milliseconds.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [value, delay]);

  return debouncedValue;
}
