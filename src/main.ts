import { displayDraw, getAppSettings } from "@shared/device";
import manifest from "./appmeta/manifest.json";
import { frame } from "./frame.ts";
import { DEFAULTS, normalizeSettings, type ClockSettings } from "./time.ts";

const APP = manifest.id;

const REDRAW_INTERVAL_MS = 1000;

let settings: ClockSettings = DEFAULTS;

function report(err: unknown) {
  console.error(`${APP}: ${err instanceof Error ? err.message : String(err)}`);
}

async function loadSettings() {
  try {
    settings = normalizeSettings((await getAppSettings(APP)).values);
  } catch (err) {
    report(err);
  }
}

export default function run() {
  let stopped = false;
  let drawing = false;
  let shownFrame = "";

  async function draw() {
    const elements = frame(new Date(), settings);
    const next = JSON.stringify(elements);

    // Without seconds and blinking colons the frame only changes once a minute
    if (next === shownFrame) {
      return;
    }

    await displayDraw({ application_name: APP, priority: 50, elements });
    shownFrame = next;
  }

  const redrawTimer = setInterval(() => {
    if (stopped || drawing) {
      return;
    }

    drawing = true;

    draw()
      .catch(report)
      .finally(() => (drawing = false));
  }, REDRAW_INTERVAL_MS);

  const unbind = listen("input", (event) => {
    if (stopped || event.key !== "back" || event.action !== "press") {
      return;
    }

    stopped = true;
    clearInterval(redrawTimer);

    setTimeout(unbind, 10);
  });

  loadSettings()
    .then(() => {
      if (!stopped) {
        return draw();
      }
    })
    .catch(report);
}
