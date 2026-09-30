// Time and date formatting, per appmeta/settings.json.


/** Values of the settings fields. */
export interface ClockSettings {
  time_format: "24h" | "12h";
  show_date: boolean;
  show_seconds: boolean;
  blink_colons: boolean;
}

/** Defaults, matching appmeta/settings.json. */
export const DEFAULTS: ClockSettings = {
  time_format: "24h",
  show_date: true,
  show_seconds: false,
  blink_colons: true,
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SUFFIXES = ["AM", "PM"];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The time, with the AM/PM suffix returned separately. In 12-hour format the hour has no leading zero.
 */
export function formatTimeParts(
  d: Date,
  s: ClockSettings = DEFAULTS,
): { time: string; suffix: string } {
  const seconds = s.show_seconds ? `:${pad(d.getSeconds())}` : "";
  if (s.time_format === "12h") {
    const h24 = d.getHours();
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      time: `${h12}:${pad(d.getMinutes())}${seconds}`,
      suffix: h24 < 12 ? SUFFIXES[0] : SUFFIXES[1],
    };
  }
  return { time: `${pad(d.getHours())}:${pad(d.getMinutes())}${seconds}`, suffix: "" };
}

/** A piece of the time string: digits or a colon. */
export interface TimeSegment {
  text: string;
  /** Colons take their own opacity. */
  colon: boolean;
}

/** Splits the time into digit groups and colons: "12:05" → ["12", ":", "05"]. */
export function splitTime(time: string): TimeSegment[] {
  const segments: TimeSegment[] = [];
  for (const part of time.split(":")) {
    if (segments.length > 0) segments.push({ text: ":", colon: true });
    segments.push({ text: part, colon: false });
  }
  return segments;
}

/** Whether the colons are in their dimmed blink phase. */
export function colonDimmed(d: Date, s: ClockSettings = DEFAULTS): boolean {
  return s.blink_colons && d.getSeconds() % 2 === 1;
}

/** Three-letter month, e.g. "Jul". */
export function formatMonth(d: Date): string {
  return MONTHS[d.getMonth()];
}

/** Three-letter weekday, e.g. "Fri". */
export function formatWeekday(d: Date): string {
  return DAYS[d.getDay()];
}

/** Day of the month, without a leading zero. */
export function formatDayOfMonth(d: Date): string {
  return String(d.getDate());
}

/** Normalizes stored values; unknown and missing fields fall back to defaults. */
export function normalizeSettings(raw: Record<string, unknown> | null | undefined): ClockSettings {
  const values = raw ?? {};
  const pick = <K extends keyof ClockSettings>(key: K, allowed?: readonly ClockSettings[K][]): ClockSettings[K] => {
    const v = values[key];
    if (typeof v !== typeof DEFAULTS[key]) return DEFAULTS[key];
    if (allowed && !allowed.includes(v as ClockSettings[K])) return DEFAULTS[key];
    return v as ClockSettings[K];
  };

  return {
    time_format: pick("time_format", ["24h", "12h"]),
    show_date: pick("show_date"),
    show_seconds: pick("show_seconds"),
    blink_colons: pick("blink_colons"),
  };
}
