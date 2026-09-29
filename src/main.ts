import { displayDraw, getAppSettings } from "@shared/device";
import manifest from "./appmeta/manifest.json";
import { frame } from "./frame.ts";
import { DEFAULTS, normalizeSettings, type ClockSettings } from "./time.ts";

const APP = manifest.id;

const REDRAW_INTERVAL_MS = 1000;

let settings: ClockSettings = DEFAULTS;
let drawing = false;

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

async function draw() {
  await displayDraw({ application_name: APP, priority: 50, elements: frame(new Date(), settings) });
}

export default function run() {
  loadSettings().then(draw).catch(report);

  setInterval(() => {
    if (drawing) {
      return;
    }

    drawing = true;

    draw()
      .catch(report)
      .finally(() => (drawing = false));
  }, REDRAW_INTERVAL_MS);
}
