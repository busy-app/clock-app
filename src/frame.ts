import type { DisplayElement, TextElement } from "@shared/device";
import { ASCENT, CAP_TOP, textWidth, type Font } from "./font.ts";
import {
  colonDimmed,
  formatDate,
  formatDayOfMonth,
  formatMonth,
  formatTimeParts,
  formatWeekday,
  splitTime,
  type ClockSettings,
} from "./time.ts";

const SCREEN = { width: 72, height: 16 };

const ICON_FILE = "images/calendar.png";

const ICON = { width: 13, height: 14 };

const SUFFIX_GAP = 1;
const ICON_GAP = 2;
const LINE_GAP = 2;

/** Line heights, from the top of the digits and capitals down to the baseline. */
const TIME_HEIGHT = ASCENT.bold - CAP_TOP;
const SUB_HEIGHT = ASCENT.small - CAP_TOP;

const WHITE = "#FFFFFFFF";
const SUBTLE_WHITE = "#FFFFFF80";
const BLACK = "#000000FF";

const DAY_OFFSET = { dx: 1, dy: 7 };

function text(id: string, value: string, font: Font, color: string, x: number, y: number): TextElement {
  return { type: "text", id, text: value, font, color, x, y, display: "front" };
}

function center(size: number, space: number) {
  return Math.max(0, Math.floor((space - size) / 2));
}

function subtitle(now: Date, settings: ClockSettings) {
  const parts: string[] = [];

  if (settings.show_date) parts.push(formatDate(now, settings));
  else parts.push(formatMonth(now));

  if (settings.show_weekday) parts.push(formatWeekday(now));

  return parts.join(", ");
}

function timeLine(time: string, suffix: string, dim: boolean, x: number, y: number): TextElement[] {
  const line: TextElement[] = [];

  splitTime(time).forEach((segment, i) => {
    const id = segment.colon ? `colon${i}` : `time${i}`;
    line.push(text(id, segment.text, "bold", segment.colon && dim ? SUBTLE_WHITE : WHITE, x, y));
    x += textWidth(segment.text, "bold");
  });

  if (suffix) {
    line.push(text("suffix", suffix, "small", WHITE, x + SUFFIX_GAP, y + ASCENT.bold - ASCENT.small));
  }

  return line;
}


function calendarIcon(now: Date, x: number): DisplayElement[] {
  const y = center(ICON.height, SCREEN.height);
  const day = formatDayOfMonth(now);
  const dayX = x + center(textWidth(day, "superscript"), ICON.width) + DAY_OFFSET.dx;

  return [
    { type: "image", id: "icon", path: ICON_FILE, x, y, display: "front" },
    text("day", day, "superscript", BLACK, dayX, y + DAY_OFFSET.dy - CAP_TOP),
  ];
}

export function frame(now: Date, settings: ClockSettings){
  const { time, suffix } = formatTimeParts(now, settings);
  const sub = settings.show_date || settings.show_weekday ? subtitle(now, settings) : "";
  const showIcon = sub.length > 0 && !settings.show_date;

  const timeWidth = textWidth(time, "bold") + (suffix ? SUFFIX_GAP + textWidth(suffix, "small") : 0);
  const width = Math.max(timeWidth, textWidth(sub, "small"));
  const height = sub ? TIME_HEIGHT + LINE_GAP + SUB_HEIGHT : TIME_HEIGHT;

  const iconSpace = showIcon ? ICON.width + ICON_GAP : 0;
  const left = center(iconSpace + width, SCREEN.width);
  const x = left + iconSpace;
  const top = center(height, SCREEN.height);

  const elements: DisplayElement[] = showIcon ? calendarIcon(now, left) : [];
  elements.push(...timeLine(time, suffix, colonDimmed(now, settings), x, top - CAP_TOP));
  
  if (sub) {
    elements.push(text("sub", sub, "small", SUBTLE_WHITE, x, top + TIME_HEIGHT + LINE_GAP - CAP_TOP));
  }
  
  return elements;
}
