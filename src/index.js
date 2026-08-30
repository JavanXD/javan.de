import slugs from "../config/article-slugs.json" with { type: "json" };
import { decide, slugSetFrom } from "./routing.js";

const SLUGS = slugSetFrom(slugs);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const decision = decide(url, SLUGS);
    const workersDev = url.hostname.endsWith(".workers.dev");

    if (decision.type === "redirect") {
      const headers = { Location: decision.location };
      if (workersDev) headers["X-Robots-Tag"] = "noindex";
      return new Response(null, { status: decision.status, headers });
    }

    if (decision.type === "block") {
      return new Response("Not Found", {
        status: decision.status || 404,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    if (decision.type === "asset") {
      const response = await env.ASSETS.fetch(request);
      return workersDev ? withNoIndex(response) : response;
    }

    if (workersDev) {
      return new Response("Not found", {
        status: 404,
        headers: { "X-Robots-Tag": "noindex" },
      });
    }

    // Route Worker (not a custom domain): fetch(request) goes to WordPress.
    return fetch(request);
  },
};

function withNoIndex(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
