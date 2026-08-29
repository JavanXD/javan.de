/**
 * Edge header shim for GitHub Pages / WordPress origins behind Cloudflare.
 * Routes: tt-cheatsheet, conference-tracker, aroundtheworld (*.javan.de).
 * Fetches the zone origin and adds baseline browser security headers.
 * For aroundtheworld HTML without og:image, injects a PNG card meta tag.
 */
const SECURITY_HEADERS = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const ATW_OG =
  "https://aroundtheworld.javan.de/wp-content/uploads/2020/01/Google-Maps-Reiseplanung-Roadtrip-USA-Westcoast-1140x641.png";

const ATW_OG_META = [
  `<meta property="og:image" content="${ATW_OG}" />`,
  `<meta property="og:image:type" content="image/png" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:image" content="${ATW_OG}" />`,
].join("");

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const res = await fetch(request);
    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      headers.set(k, v);
    }

    const ct = (headers.get("content-type") || "").toLowerCase();
    const isHtml = ct.includes("text/html");
    const isAtw = url.hostname === "aroundtheworld.javan.de";

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
