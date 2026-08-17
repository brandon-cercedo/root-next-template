import moment from "moment";

type HumanizeDateSize = "xs" | "sm" | "base";

const MOMENT_LOCALE_NAMES: Record<HumanizeDateSize, string> = {
  xs: "en-xs",
  sm: "en-sm",
  base: "en",
};

function defineCustomLocales() {
  const locales = moment.locales();

  if (!locales.includes("en-xs")) {
    moment.defineLocale("en-xs", {
      parentLocale: "en",
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "1s",
        ss: "%ds",
        m: "1m",
        mm: "%dm",
        h: "1h",
        hh: "%dh",
        d: "1d",
        dd: "%dd",
        M: "1mo",
        MM: "%dmo",
        y: "1y",
        yy: "%dy",
      },
    });
  }
  if (!locales.includes("en-sm")) {
    moment.defineLocale("en-sm", {
      parentLocale: "en",
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "1 sec",
        ss: "%d sec",
        m: "1 min",
        mm: "%d min",
        h: "1 hr",
        hh: "%d hr",
        d: "1 day",
        dd: "%d days",
        M: "1 month",
        MM: "%d months",
        y: "1 year",
        yy: "%d years",
      },
    });
  }
}

/**
 * @see {@link https://momentjs.com/docs/#/customization/relative-time/ |Relative Time}
 */
export function humanizeDate(
  date: Date | string | number,
  size: HumanizeDateSize = "base"
): string {
  const fixedDate = moment(date);

  defineCustomLocales();
  const locale = MOMENT_LOCALE_NAMES[size];
  fixedDate.locale(locale);

  return fixedDate.fromNow();
}

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
