export const BLOG_ORIGIN = "https://blog.javan.de";
export const BLOG_FEED = `${BLOG_ORIGIN}/feed.xml`;

// Path short links: also in Bulk Redirects + `_redirects` (quota-free).
// Worker copy is fallback (and the reason these are not zone Single Redirects).
export const SHORT_LINKS = {
  zoom: {
    status: 301,
    location: "https://us05web.zoom.us/j/9920725030?pwd=SmhYQzRyMkx1TzdUMWx1WnNJUTFBQT09",
  },
  meet: {
    status: 301,
    location: "https://meet.google.com/ctc-ubna-dpp",
  },
  "secure-coding": {
    status: 302,
    location: "https://docs.google.com/document/d/1jJvLSWIBZQgBgxcoGCgV6PPbUBss35qZwLrrMiMlcuc/",
  },
  csslp: {
    status: 302,
    location:
      "https://docs.google.com/document/d/1Y05eOWky3rhZNqzL-w15tORRRP-U0R7sOU5kuT4p4MQ/edit?usp=sharing",
  },
};

const LANDING_ASSETS = new Set([
  "/",
  "/index.html",
  "/blinky.svg",
  "/bimi-logo.svg",
  "/favicon.ico",
  "/favicon-192.png",
  "/og-image.jpg",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-main.xml",
  "/sitemap-subdomains.xml",
]);

/** WordPress fingerprint / scanner paths — block at the edge (404). Keep /wp-login.php and /wp-admin/ on origin. */
const WP_BLOCKED_EXACT = new Set([
  "/xmlrpc.php",
  "/readme.html",
  "/license.txt",
  "/wlwmanifest.xml",
  "/wp-includes/wlwmanifest.xml",
  "/wp-config.php",
  "/wp-content/debug.log",
  "/wp-json/wp/v2/users",
  "/.env",
  "/wp-admin/install.php",
  "/wp-admin/setup-config.php",
]);

/** Common scanner path prefixes (exact login/admin paths stay on origin). */
export function isWpBlockedPath(pathname) {
  const path = normalizePathname(pathname).toLowerCase();

  if (WP_BLOCKED_EXACT.has(path)) return true;
  if (path.startsWith("/.env.")) return true;
  if (path === "/phpmyadmin" || path.startsWith("/phpmyadmin/")) return true;
  if (path.startsWith("/wp-config.")) return true;
  if (path.startsWith("/wp-json/wp/v2/users/")) return true;
  if (path.startsWith("/wp-includes/") && path.endsWith(".php")) return true;
  if (path.startsWith("/wp-content/plugins/") && (path.endsWith(".php") || path.endsWith("/readme.txt"))) {
    return true;
  }

  return false;
}

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
  // www → apex. Zone Single Redirect is the quota-free path; this is fallback.
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

  if (isWpBlockedPath(pathname)) {
    return { type: "block", status: 404 };
  }

  if (first && Object.hasOwn(SHORT_LINKS, first) && pathHasOnlySegment(pathname, first)) {
    const short = SHORT_LINKS[first];
    return { type: "redirect", status: short.status, location: short.location };
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

function pathHasOnlySegment(pathname, segment) {
  return pathname === `/${segment}`;
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
