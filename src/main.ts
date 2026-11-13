import { appsSettingsGet, BusyBarAppClient, displayDraw } from "@busy-app/busy-lib";
import { id as APP } from "./appmeta/manifest.json";
import { frame } from "./frame.ts";
import { DEFAULTS, type ClockSettings } from "./settings.ts";

const REDRAW_INTERVAL_MS = 1000;

const client = new BusyBarAppClient({ addr: __BUSY_ADDR__ });

let settings = DEFAULTS;

function report(err: unknown) {
  console.error(`${APP}: ${err instanceof Error ? err.message : String(err)}`);
}

async function loadSettings() {
  try {
    const { values } = await appsSettingsGet(client, { app_id: APP });
    settings = { ...DEFAULTS, ...(values as Partial<ClockSettings>) };
  } catch (err) {
    report(err);
  }
}

/**
 * Entry point, called at the end of the file: the device runs this script from top to bottom and starts nothing by itself.
 */
function main() {
  let stopped = false;
  let drawing = false;
  let shownFrame = "";

  async function draw() {
    if (stopped || drawing) {
      return;
    }

    drawing = true;

    try {
      const elements = frame(new Date(), settings);
      const next = JSON.stringify(elements);

      if (next !== shownFrame) {
        await displayDraw(client, { application_name: APP, elements });
        shownFrame = next;
      }
    } catch (err) {
      report(err);
    } finally {
      drawing = false;
    }
  }

  async function start() {
    await loadSettings();
    await draw();
  }

  const redrawTimer = setInterval(draw, REDRAW_INTERVAL_MS);

  const unbind = listen("input", (event) => {
    if (stopped || event.key !== "back" || event.action !== "short") {
      return;
    }

    stopped = true;
    clearInterval(redrawTimer);

    setTimeout(unbind, 10);
  });

  start();
}

main();
