export interface ClockSettings {
  time_format: "24h" | "12h";
  show_date: boolean;
  show_seconds: boolean;
  blink_colons: boolean;
}

export const DEFAULTS: ClockSettings = {
  time_format: "24h",
  show_date: true,
  show_seconds: false,
  blink_colons: true,
};
