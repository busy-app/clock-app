import {
  column,
  formatDayOfMonth,
  formatMonth,
  formatTime,
  formatWeekday,
  render,
  row,
  stack,
  type TextNode,
} from "@busy-app/busy-lib";
import type { ClockSettings } from "./settings.ts";

const ICON = { path: "images/calendar.png", width: 13, height: 14 };

const SUFFIX_GAP = 1;
const ICON_GAP = 2;
const LINE_GAP = 2;

const WHITE = "#FFFFFFFF";
const DIMMED_WHITE = "#FFFFFF7F";
const BLINKED_WHITE = "#FFFFFF66";
const DAY_COLOR = "#323232FF";

const DAY_OFFSET = { dx: 1, dy: 7 };

function timeLine(now: Date, settings: ClockSettings) {
  const { time, suffix } = formatTime(now, {
    hour12: settings.time_format === "12h",
    seconds: settings.show_seconds,
  });
  const colonColor = settings.blink_colons && now.getSeconds() % 2 === 1 ? BLINKED_WHITE : WHITE;

  const segments: TextNode[] = [];
  for (const digits of time.split(":")) {
    if (segments.length > 0) {
      segments.push({ type: "text", id: `colon${segments.length}`, text: ":", font: "bold", color: colonColor });
    }

    segments.push({ type: "text", id: `time${segments.length}`, text: digits, font: "bold", color: WHITE });
  }

  const digits = row({}, segments);

  if (!suffix) {
    return digits;
  }

  return row({ gap: SUFFIX_GAP }, [
    digits,
    { type: "text", id: "suffix", text: suffix, font: "small", color: WHITE },
  ]);
}

function calendarIcon(now: Date) {
  return stack({ justify: "center" }, [
    { type: "image", id: "icon", ...ICON },
    { type: "text", id: "day", text: formatDayOfMonth(now), font: "superscript", color: DAY_COLOR, ...DAY_OFFSET },
  ]);
}

function dateLine(now: Date): TextNode {
  return { type: "text", id: "sub", text: `${formatMonth(now)}, ${formatWeekday(now)}`, font: "small", color: DIMMED_WHITE };
}

export function frame(now: Date, settings: ClockSettings) {
  const content = settings.show_date
    ? [calendarIcon(now), column({ gap: LINE_GAP }, [timeLine(now, settings), dateLine(now)])]
    : [timeLine(now, settings)];

  return render(row({ gap: ICON_GAP, justify: "center", align: "center" }, content));
}
