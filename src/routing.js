export const BLOG_ORIGIN = "https://blog.javan.de";
export const BLOG_FEED = `${BLOG_ORIGIN}/feed.xml`;

// Short links (/zoom, /meet, /secure-coding, /csslp) live in zone Single
// Redirects only. Those rules run in http_request_dynamic_redirect *before*
// Workers, so this script never sees apex short-link traffic. Do not re-add
// them here: with routes on javan.de/*, returning type "origin" would hit
// WordPress only if the Rule were deleted — Rules are the source of truth.
// (assets.run_worker_first only orders Worker vs static assets, not vs Rules.)

const LANDING_ASSETS = new Set([
  "/",
  "/index.html",
  "/blinky.svg",
  "/favicon.ico",
  "/favicon-192.png",
  "/og-image.jpg",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-main.xml",
  "/sitemap-subdomains.xml",
]);

/** WordPress fingerprint / XML-RPC paths — block at the edge (404). Keep /wp-login.php and /wp-admin/ on origin. */
const WP_BLOCKED_PATHS = new Set([
  "/xmlrpc.php",
  "/readme.html",
  "/license.txt",
  "/wp-admin/install.php",
  "/wp-admin/setup-config.php",
]);

export function slugSetFrom(slugs) {
  const set = new Set();
  for (const slug of slugs) {
    set.add(slug);
    try {
      set.add(decodeURIComponent(slug));
    } catch {
      // keep the raw slug
    }
  }
  return set;
}

/**
 * Decide how the landing Worker should handle a request.
 * WordPress stays the origin: unknown paths and /wp-* are passed through.
 */
export function decide(url, slugs) {
  // www → apex (no zone www Single Redirect; Worker owns this). Preserve path + query.
  if (isWwwHost(url.hostname)) {
    return {
      type: "redirect",
      status: 301,
      location: `https://javan.de${url.pathname}${url.search}`,
    };
  }

  const pathname = normalizePathname(url.pathname);
  const first = firstSegment(pathname);
  const slugSet = slugs instanceof Set ? slugs : slugSetFrom(slugs);

  if (WP_BLOCKED_PATHS.has(pathname.toLowerCase())) {
    return { type: "block", status: 404 };
  }

  if (first && slugSet.has(first)) {
    return {
      type: "redirect",
      status: 301,
      location: `${BLOG_ORIGIN}/${encodeURI(first)}/`,
    };
  }

  if (isFeed(url, pathname, first)) {
    return { type: "redirect", status: 301, location: BLOG_FEED };
  }

  if (LANDING_ASSETS.has(pathname)) {
    return { type: "asset" };
  }

  return { type: "origin" };
}

export function normalizePathname(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }
  if (!decoded.startsWith("/")) decoded = `/${decoded}`;
  if (decoded.length > 1 && decoded.endsWith("/")) decoded = decoded.slice(0, -1);
  return decoded || "/";
}

function isWwwHost(hostname) {
  return hostname === "www.javan.de";
}

function firstSegment(pathname) {
  if (pathname === "/") return "";
  return pathname.slice(1).split("/")[0];
}

function isFeed(url, pathname, first) {
  const feedParam = url.searchParams.get("feed");
  if (feedParam && /^(rss|rss2|atom|rdf)$/i.test(feedParam)) return true;

  if (first === "feed" || first === "rss" || first === "feed.xml" || first === "atom") {
    return true;
  }

  const parts = pathname.split("/").filter(Boolean);
  const last = (parts[parts.length - 1] || "").toLowerCase();
  return last === "feed" || last === "rss" || last === "feed.xml" || last === "atom";
}
