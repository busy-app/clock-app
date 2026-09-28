interface Placed {
  id: string;
  x: number;
  y: number;
  display: "front" | "back";
}

export interface TextElement extends Placed {
  type: "text";
  text: string;
  font: "tiny" | "small" | "normal" | "condensed" | "bold" | "large" | "extra_large" | "global" | "superscript";
  /** #RRGGBBAA. */
  color: string;
}

export interface ImageElement extends Placed {
  type: "image";
  path: string;
}

export type DisplayElement = TextElement | ImageElement;

export interface DrawRequest {
  application_name: string;
  /** 1–100; draws at or above the running app's priority take the screen. */
  priority: number;
  elements: DisplayElement[];
}

export interface AppSettingsDocument {
  version: number;
  /** Keyed by field id. */
  values: Record<string, unknown>;
}

/** Device address; in dev from VITE_BUSY_ADDR (.env). */
const addr = import.meta.env.VITE_BUSY_ADDR ?? "localhost";
const API = `${/^https?:\/\//i.test(addr) ? addr : `http://${addr}`}/api`;

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, init);

  if (!res.ok) {
    throw new Error(`${path}: HTTP ${res.status} ${await res.text()}`);
  }

  return res;
}

export async function displayDraw(request: DrawRequest) {
  await call("/display/draw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export async function getAppSettings(appId: string) {
  const res = await call(`/apps/settings?app_id=${encodeURIComponent(appId)}`);
  return (await res.json()) as AppSettingsDocument;
}
