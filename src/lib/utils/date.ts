type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/**
 * @see {@link https://www.britannica.com/dictionary/eb/qa/parts-of-the-day-early-morning-late-morning-etc | Parts of the Day: Early morning, late morning, etc.}
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "evening";
  }
  return "night";
}
