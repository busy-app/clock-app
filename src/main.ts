import { device } from "@shared/device";
import manifest from "./appmeta/manifest.json";
import { loadValues } from "@shared/settings";
import { frame } from "./frame.ts";
import { DEFAULTS, normalizeSettings, type ClockSettings } from "./time.ts";

const APP = manifest.id;

let settings: ClockSettings = DEFAULTS;

async function loadSettings() {
  settings = normalizeSettings(await loadValues());
}

async function draw() {
  await device.DisplayDraw({ application_name: APP, priority: 50, elements: frame(new Date(), settings) });
}

export default function run() {
  loadSettings()
    .then(() => draw())
    .catch((err) =>
      console.error(
        `${APP}: failed to initialize the app — ${err instanceof Error ? err.message : String(err)}`,
      ),
    );

  setInterval(() => {
    draw().catch((err) =>
      console.error(`${APP}: ${err instanceof Error ? err.message : String(err)}`),
    );
  }, 1000);
}
