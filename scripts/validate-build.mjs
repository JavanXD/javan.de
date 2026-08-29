#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const failures = [];

async function check(name, assert) {
  let contents;
  try {
    contents = await readFile(join(dist, name), "utf8");
  } catch {
    failures.push(`${name} is missing from dist/`);
    return;
  }
  assert(contents);
}

await check("index.html", (contents) => {
  if (!contents.includes("<h1>javan<span>.de</span></h1>")) {
    failures.push("index.html is not the arcade landing page");
  }
});

await check("blinky.svg", (contents) => {
  if (!contents.includes("<svg")) failures.push("blinky.svg is not an SVG");
});

await check("robots.txt", (contents) => {
  if (!contents.includes("User-agent: *")) failures.push("robots.txt is missing a user-agent rule");
  if (!contents.includes("Sitemap: https://javan.de/sitemap.xml")) {
    failures.push("robots.txt is missing the sitemap URL");
  }
});

try {
  await readFile(join(dist, "favicon-192.png"));
} catch {
  failures.push("favicon-192.png is missing from dist/");
}

await check("sitemap.xml", (contents) => {
  if (!contents.includes("<sitemapindex")) failures.push("sitemap.xml is not a sitemap index");
});

await check("_headers", (contents) => {
  for (const header of ["X-Content-Type-Options: nosniff", "X-Robots-Tag: noindex"]) {
    if (!contents.includes(header)) failures.push(`_headers is missing ${header}`);
  }
  if (!contents.includes("https://:subdomain.workers.dev/*")) {
    failures.push("_headers is missing a workers.dev noindex rule");
  }
});

if (failures.length) {
  console.error("Build validation failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Validated landing assets in dist/.");
}
