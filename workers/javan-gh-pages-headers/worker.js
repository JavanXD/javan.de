/**
 * Edge header shim for GitHub Pages / WordPress origins behind Cloudflare.
 * Routes: tt-cheatsheet, conference-tracker, aroundtheworld (*.javan.de).
 * Fetches the zone origin and adds baseline browser security headers.
 * For aroundtheworld: blocks WP XML-RPC/fingerprint paths; injects og:image when missing.
 * Host-specific Content-Security-Policy for static docs hosts.
 */
const SECURITY_HEADERS = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/** WordPress fingerprint / XML-RPC — block at edge for aroundtheworld. */
const WP_BLOCKED_PATHS = new Set([
  "/xmlrpc.php",
  "/readme.html",
  "/license.txt",
  "/wp-admin/install.php",
  "/wp-admin/setup-config.php",
]);

const ATW_OG =
  "https://aroundtheworld.javan.de/wp-content/uploads/2020/01/Google-Maps-Reiseplanung-Roadtrip-USA-Westcoast-1140x641.png";

const ATW_OG_META = [
  `<meta property="og:image" content="${ATW_OG}" />`,
  `<meta property="og:image:type" content="image/png" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:image" content="${ATW_OG}" />`,
].join("");

/** CSP tuned per host (static docs / app shells). */
const CSP_BY_HOST = {
  "tt-cheatsheet.javan.de":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: https://cdnjs.cloudflare.com; " +
    "connect-src 'self' https://cdn.jsdelivr.net; " +
    "worker-src 'self' blob:; upgrade-insecure-requests",
  "conference-tracker.javan.de":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; " +
    "script-src 'self' https://cdnjs.cloudflare.com; " +
    "style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; " +
    "img-src 'self' data: https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org; " +
    "connect-src 'self' https://geocoding-api.open-meteo.com; " +
    "font-src 'self'; upgrade-insecure-requests",
};

function normalizePathname(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }
  if (!decoded.startsWith("/")) decoded = `/${decoded}`;
  if (decoded.length > 1 && decoded.endsWith("/")) decoded = decoded.slice(0, -1);
  return (decoded || "/").toLowerCase();
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const isAtw = url.hostname === "aroundtheworld.javan.de";
    const path = normalizePathname(url.pathname);

    if (isAtw && WP_BLOCKED_PATHS.has(path)) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          ...SECURITY_HEADERS,
        },
      });
    }

    const res = await fetch(request);
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      headers.set(k, v);
    }
    // GitHub Pages often sends ACAO: *; unused by these static docs hosts — drop it.
    headers.delete("Access-Control-Allow-Origin");

    const csp = CSP_BY_HOST[url.hostname];
    if (csp) {
      headers.set("Content-Security-Policy", csp);
    }

    const ct = (headers.get("content-type") || "").toLowerCase();
    const isHtml = ct.includes("text/html");

    if (isAtw && isHtml && request.method === "GET") {
      const html = await res.text();
      if (!/property=["']og:image["']/i.test(html)) {
        const injected = html.replace(/<\/head>/i, `${ATW_OG_META}</head>`);
        headers.delete("content-length");
        return new Response(injected, {
          status: res.status,
          statusText: res.statusText,
          headers,
        });
      }
      return new Response(html, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  },
};
