#!/usr/bin/env node

import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const publicDir = join(root, "public");

await mkdir(dist, { recursive: true });

const rootFiles = ["index.html", "blinky.svg", "_headers", "favicon-192.png"];
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

console.log(`Copied landing assets into ${dist}`);
