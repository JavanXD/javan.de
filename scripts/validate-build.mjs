#!/usr/bin/env node

import { createHash } from "node:crypto";
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
  await assert(contents);
}

function styleSrcHashes(cspSource) {
  const match = cspSource.match(/style-src\s+([^;]+)/);
  if (!match) return [];
  return [...match[1].matchAll(/'sha256-([^']+)'/g)].map((m) => m[1]);
}

function inlineStyleHashes(html) {
  return [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) =>
    createHash("sha256").update(m[1], "utf8").digest("base64"),
  );
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

  const metaCsp = contents.match(
    /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
  )?.[1];
  if (!metaCsp) {
    failures.push("index.html is missing a Content-Security-Policy meta tag");
  } else {
    const allowed = new Set(styleSrcHashes(metaCsp));
    for (const hash of inlineStyleHashes(contents)) {
      if (!allowed.has(hash)) {
        failures.push(
          `index.html inline <style> hash sha256-${hash} is missing from meta style-src (update CSP after CSS edits)`,
        );
      }
    }
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

await check("_headers", async (contents) => {
  for (const header of ["X-Content-Type-Options: nosniff", "X-Robots-Tag: noindex"]) {
    if (!contents.includes(header)) failures.push(`_headers is missing ${header}`);
  }
  if (!contents.includes("https://:subdomain.workers.dev/*")) {
    failures.push("_headers is missing a workers.dev noindex rule");
  }

  const headerCsp = contents.match(/Content-Security-Policy:\s*(.+)/)?.[1]?.trim();
  if (!headerCsp) {
    failures.push("_headers is missing Content-Security-Policy");
    return;
  }
  let html;
  try {
    html = await readFile(join(dist, "index.html"), "utf8");
  } catch {
    return;
  }
  const allowed = new Set(styleSrcHashes(headerCsp));
  for (const hash of inlineStyleHashes(html)) {
    if (!allowed.has(hash)) {
      failures.push(
        `_headers style-src is missing sha256-${hash} for an index.html <style> block (update CSP after CSS edits)`,
      );
    }
  }
});

await check("_redirects", (contents) => {
  if (!contents.includes("/the-future-security-engineer")) {
    failures.push("_redirects is missing a known article slug");
  }
  if (!contents.includes("https://blog.javan.de/feed.xml")) {
    failures.push("_redirects is missing the blog feed target");
  }
  if (!contents.includes("/zoom ")) {
    failures.push("_redirects is missing /zoom");
  }
});

if (failures.length) {
  console.error("Build validation failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Validated landing assets in dist/.");
}
