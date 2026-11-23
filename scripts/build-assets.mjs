#!/usr/bin/env node

import { copyFile, cp, mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { staticRedirectsFile } from "./quota-free-redirects.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const publicDir = join(root, "public");
const vendorWeb = join(root, "vendor", "@javan", "web");

await mkdir(dist, { recursive: true });

const rootFiles = ["index.html", "blinky.svg", "bimi-logo.svg", "_headers", "favicon.ico", "favicon-192.png", "og-image.jpg"];
for (const name of rootFiles) {
  try {
    await copyFile(join(root, name), join(dist, name));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

for (const name of await readdir(publicDir)) {
  if (name.startsWith(".")) continue;
  await copyFile(join(publicDir, name), join(dist, name));
}

// Shared @javan/web footer CSS + assets (pinned vendor copy).
await cp(join(vendorWeb, "styles"), join(dist, "styles"), { recursive: true });
await cp(join(vendorWeb, "assets"), join(dist, "assets"), { recursive: true });
// Apex arcade landing stylesheet (host chrome; tokens come from javan-tokens.css).
await mkdir(join(dist, "styles"), { recursive: true });
await copyFile(join(root, "styles", "arcade.css"), join(dist, "styles", "arcade.css"));

await writeFile(join(dist, "_redirects"), staticRedirectsFile());

// Drop retired public assets that may linger in dist/ from older builds.
for (const name of ["sitemap-projects.xml"]) {
  try {
    await unlink(join(dist, name));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

console.log(`Copied landing assets into ${dist}`);
