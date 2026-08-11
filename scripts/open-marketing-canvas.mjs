#!/usr/bin/env node
/**
 * Open the marketing homepage in Chromium with HTML-in-Canvas enabled.
 *
 * Chrome/Brave block flipping chrome://flags from the web for security.
 * This launches a dedicated profile with:
 *   --enable-blink-features=CanvasDrawElement
 * (same capability as chrome://flags/#canvas-draw-element)
 *
 * Usage (repo root):
 *   pnpm canvas:preview
 *   pnpm canvas:preview -- http://localhost:3000/blog
 *
 * Prefers Chrome Canary, then Brave, Chrome, Edge.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const URL =
  process.argv.slice(2).find((a) => !a.startsWith("-")) ??
  "http://localhost:3000/";
const BLINK = "CanvasDrawElement";
const PROFILE = join(homedir(), ".edubridge", "chromium-canvas-profile");

const localApp = process.env.LOCALAPPDATA ?? "";
const prog = process.env.PROGRAMFILES ?? "C:\\Program Files";
const prog86 = process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)";

/** @type {{ name: string; bin: string }[]} */
const CANDIDATES =
  process.platform === "win32"
    ? [
        {
          name: "Chrome Canary",
          bin: join(localApp, "Google", "Chrome SxS", "Application", "chrome.exe"),
        },
        {
          name: "Brave",
          bin: join(
            prog,
            "BraveSoftware",
            "Brave-Browser",
            "Application",
            "brave.exe",
          ),
        },
        {
          name: "Brave (x86)",
          bin: join(
            prog86,
            "BraveSoftware",
            "Brave-Browser",
            "Application",
            "brave.exe",
          ),
        },
        {
          name: "Chrome",
          bin: join(prog, "Google", "Chrome", "Application", "chrome.exe"),
        },
        {
          name: "Chrome (x86)",
          bin: join(prog86, "Google", "Chrome", "Application", "chrome.exe"),
        },
        {
          name: "Edge",
          bin: join(prog86, "Microsoft", "Edge", "Application", "msedge.exe"),
        },
        {
          name: "Edge (PF)",
          bin: join(prog, "Microsoft", "Edge", "Application", "msedge.exe"),
        },
      ]
    : process.platform === "darwin"
      ? [
          {
            name: "Chrome Canary",
            bin: "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
          },
          {
            name: "Brave",
            bin: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
          },
          {
            name: "Chrome",
            bin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          },
          {
            name: "Edge",
            bin: "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          },
        ]
      : [
          { name: "Chrome Unstable", bin: "google-chrome-unstable" },
          { name: "Brave", bin: "brave-browser" },
          { name: "Chrome", bin: "google-chrome" },
          { name: "Chromium", bin: "chromium" },
          { name: "Edge", bin: "microsoft-edge" },
        ];

function resolveBrowser() {
  for (const c of CANDIDATES) {
    if (process.platform === "linux") {
      // Bare command names — let spawn resolve via PATH
      return c;
    }
    if (existsSync(c.bin)) return c;
  }
  return null;
}

const found = resolveBrowser();
if (!found) {
  console.error(`
No Chromium browser found.

Install Chrome Canary or Brave, then either:
  1) Run: pnpm canvas:preview
  2) Or enable chrome://flags/#canvas-draw-element (Brave: brave://flags/#canvas-draw-element)

Docs: https://html-in-canvas.dev/docs/browser-support/
`);
  process.exit(1);
}

mkdirSync(PROFILE, { recursive: true });

const args = [
  `--user-data-dir=${PROFILE}`,
  `--enable-blink-features=${BLINK}`,
  "--no-first-run",
  "--no-default-browser-check",
  URL,
];

console.log(`Opening ${URL}`);
console.log(`Browser: ${found.name}`);
console.log(`Flag:    --enable-blink-features=${BLINK}`);
console.log(`Profile: ${PROFILE}`);
console.log(`
Start the app if needed: pnpm dev:edubridge
Particle-scroll / decrypt-reveal need this flag. Particle-object works without it.
`);

const child = spawn(found.bin, args, {
  detached: true,
  stdio: "ignore",
  shell: process.platform === "win32",
});
child.on("error", (err) => {
  console.error(`Failed to launch ${found.name}:`, err.message);
  process.exit(1);
});
child.unref();
