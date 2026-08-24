import { mkdir, readFile, writeFile } from "node:fs/promises";

const today = new Date().toISOString().slice(0, 10);
const outDir = new URL("../public/", import.meta.url);
const FETCH_TIMEOUT_MS = 10_000;

const config = JSON.parse(
  await readFile(new URL("../config/sitemap-links.json", import.meta.url), "utf8"),
);
const rootPages = config.rootPages;
const subdomainPages = config.subdomainPages;
const projectAndHistoricPages = config.projectAndHistoricPages;
const externalSitemaps = config.externalSitemaps ?? [];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function toDateStamp(headerValue) {
  const parsed = headerValue ? new Date(headerValue) : null;
  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toISOString().slice(0, 10)
    : null;
}

// Normalizes a URL string so trivially-equivalent variants (e.g. missing
// trailing slash) compare equal during dedupe.
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.pathname === "") parsed.pathname = "/";
    return parsed.toString();
  } catch {
    return url;
  }
}

// Finds a `<link rel="canonical" href="...">` tag in an HTML document,
// regardless of attribute order, and resolves it against the page's URL.
function extractCanonicalUrl(html, baseUrl) {
  const patterns = [
    /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        return normalizeUrl(new URL(match[1], baseUrl).toString());
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Probes a URL for liveness, its real `Last-Modified` date, and (for HTML
// pages) the canonical URL it declares. Redirects are followed, and when a
// page's own <link rel="canonical"> points elsewhere (e.g. an article that
// now canonicalizes to its mirror on another subdomain) that canonical URL
// is used instead, so mirrored/duplicate content collapses to one entry
// automatically instead of needing manual sitemap edits.
async function probeUrl(url, { checkCanonical }) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false };
    const lastmod = toDateStamp(response.headers.get("last-modified")) ?? today;
    const finalUrl = normalizeUrl(response.url || url);
    const contentType = response.headers.get("content-type") ?? "";
    if (checkCanonical && contentType.includes("html")) {
      const html = await response.text();
      const canonicalUrl = extractCanonicalUrl(html, finalUrl);
      if (canonicalUrl) return { ok: true, lastmod, url: canonicalUrl };
    }
    return { ok: true, lastmod, url: finalUrl };
  } catch {
    return { ok: false };
  }
}

// Resolves lastmod dates (and canonical URLs) for a list of URLs.
// Unreachable URLs are dropped when `dropIfUnreachable` is true, otherwise
// kept with today's date so the site's own root pages never disappear from
// the sitemap due to a hiccup.
async function resolveUrls(urls, { dropIfUnreachable, checkCanonical = true }) {
  const results = await Promise.all(
    urls.map(async (url) => {
      const probe = await probeUrl(url, { checkCanonical });
      if (!probe.ok) {
        console.warn(`\u26a0\ufe0f  Unreachable, ${dropIfUnreachable ? "dropping" : "keeping"}: ${url}`);
        return dropIfUnreachable ? null : { url: normalizeUrl(url), lastmod: today };
      }
      if (probe.url !== normalizeUrl(url)) {
        console.log(`\u2139\ufe0f  ${url} -> canonical ${probe.url}`);
      }
      return { url: probe.url, lastmod: probe.lastmod };
    }),
  );
  return results.filter((entry) => entry !== null);
}

// Drops entries whose (canonical) URL already appeared in an earlier list,
// so mirrored/duplicate content is only listed once. Lists are deduped in
// priority order: root pages win, then subdomains, then project pages.
function dedupeAcrossLists(lists) {
  const seen = new Set();
  return lists.map((entries) =>
    entries.filter((entry) => {
      if (seen.has(entry.url)) {
        console.log(`\u2139\ufe0f  Dropping duplicate (already listed): ${entry.url}`);
        return false;
      }
      seen.add(entry.url);
      return true;
    }),
  );
}

function renderUrlSet(entries) {
  const body = entries
    .map((entry) => `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function renderSitemapIndex(paths, externalEntries) {
  const entries = paths
    .map(
      (path) =>
        `  <sitemap>\n    <loc>https://www.javan.de/${path}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  const externalPart = externalEntries
    .map(
      (entry) =>
        `  <sitemap>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  const combined = [entries, externalPart].filter(Boolean).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${combined}\n</sitemapindex>\n`;
}

const [resolvedRoot, resolvedSubdomains, resolvedProjects, resolvedExternal] = await Promise.all([
  resolveUrls(rootPages, { dropIfUnreachable: false }),
  resolveUrls(subdomainPages, { dropIfUnreachable: true }),
  resolveUrls(projectAndHistoricPages, { dropIfUnreachable: true }),
  resolveUrls(externalSitemaps, { dropIfUnreachable: false, checkCanonical: false }),
]);

// Dedupe page URLs across lists (priority: root > subdomains > projects).
// External sitemaps are a different namespace (child sitemap files, not
// pages) so they're excluded from this pass.
const [dedupedRoot, dedupedSubdomains, dedupedProjects] = dedupeAcrossLists([
  resolvedRoot,
  resolvedSubdomains,
  resolvedProjects,
]);

const sitemapFiles = [
  { file: "sitemap-main.xml", urls: dedupedRoot },
  { file: "sitemap-subdomains.xml", urls: dedupedSubdomains },
  { file: "sitemap-projects.xml", urls: dedupedProjects },
];

await mkdir(outDir, { recursive: true });

for (const { file, urls } of sitemapFiles) {
  await writeFile(new URL(file, outDir), renderUrlSet(urls), "utf8");
}

await writeFile(
  new URL("sitemap.xml", outDir),
  renderSitemapIndex(sitemapFiles.map(({ file }) => file), resolvedExternal),
  "utf8",
);

const robotsTemplate = await readFile(
  new URL("../config/robots-template.txt", import.meta.url),
  "utf8",
);
const robots = `${robotsTemplate.trimEnd()}\n\n# Sitemap location\nSitemap: https://www.javan.de/sitemap.xml\n`;
await writeFile(new URL("robots.txt", outDir), robots, "utf8");

console.log(
  `Generated sitemap index + ${sitemapFiles.length} child sitemaps in public/ ` +
    `(${dedupedSubdomains.length}/${subdomainPages.length} subdomains, ` +
    `${dedupedProjects.length}/${projectAndHistoricPages.length} project pages live).`,
);
