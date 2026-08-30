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
  if (!contents.includes("img-src 'self'")) {
    failures.push("index.html CSP is missing img-src 'self' (needed for Firefox favicons)");
  }
  if (!contents.includes('href="/favicon.ico"')) {
    failures.push("index.html is missing /favicon.ico link");
  }
  if (!contents.includes('property="og:image"') || !contents.includes("https://javan.de/og-image.jpg")) {
    failures.push("index.html is missing og:image → og-image.jpg");
  }
  if (!contents.includes('name="twitter:card"') || !contents.includes("summary_large_image")) {
    failures.push("index.html is missing twitter:card=summary_large_image");
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

try {
  await readFile(join(dist, "favicon.ico"));
} catch {
  failures.push("favicon.ico is missing from dist/");
}

try {
  await readFile(join(dist, "og-image.jpg"));
} catch {
  failures.push("og-image.jpg is missing from dist/");
}

await check("sitemap.xml", (contents) => {
  if (!contents.includes("<sitemapindex")) failures.push("sitemap.xml is not a sitemap index");
  if (!contents.includes("sitemap-main.xml")) failures.push("sitemap.xml is missing sitemap-main.xml");
  if (!contents.includes("sitemap-subdomains.xml")) {
    failures.push("sitemap.xml is missing sitemap-subdomains.xml");
  }
  if (contents.includes("sitemap-projects.xml")) {
    failures.push("sitemap.xml still lists retired sitemap-projects.xml");
  }
});

try {
  await readFile(join(dist, "sitemap-projects.xml"));
  failures.push("sitemap-projects.xml should not be copied into dist/");
} catch {
  // expected: file removed
}

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
