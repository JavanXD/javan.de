/**
 * Assert HTML contains the shared OG contract (absolute image, 1200×630, large card).
 */
import { OG_HEIGHT, OG_WIDTH } from "./card.mjs";

/**
 * @param {string} html
 * @param {{ imageUrl?: string, requireAbsolute?: boolean }} [options]
 * @returns {{ ok: boolean, failures: string[] }}
 */
export function validateShareHtml(html, options = {}) {
  const failures = [];
  const requireAbsolute = options.requireAbsolute !== false;

  if (!/property=["']og:image["']/i.test(html)) {
    failures.push("missing og:image");
  }
  if (!/name=["']twitter:card["'][^>]*content=["']summary_large_image["']/i.test(html) &&
      !/content=["']summary_large_image["'][^>]*name=["']twitter:card["']/i.test(html)) {
    failures.push("missing twitter:card=summary_large_image");
  }
  if (!new RegExp(`property=["']og:image:width["'][^>]*content=["']${OG_WIDTH}["']`, "i").test(html) &&
      !new RegExp(`content=["']${OG_WIDTH}["'][^>]*property=["']og:image:width["']`, "i").test(html)) {
    failures.push(`missing og:image:width=${OG_WIDTH}`);
  }
  if (!new RegExp(`property=["']og:image:height["'][^>]*content=["']${OG_HEIGHT}["']`, "i").test(html) &&
      !new RegExp(`content=["']${OG_HEIGHT}["'][^>]*property=["']og:image:height["']`, "i").test(html)) {
    failures.push(`missing og:image:height=${OG_HEIGHT}`);
  }

  const imageMatch = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  const imageUrl = imageMatch?.[1];
  if (imageUrl && requireAbsolute && !/^https:\/\//i.test(imageUrl)) {
    failures.push("og:image must be an absolute https URL");
  }
  if (options.imageUrl && imageUrl && imageUrl !== options.imageUrl) {
    failures.push(`og:image expected ${options.imageUrl}, got ${imageUrl}`);
  }
  if (imageUrl && /favicon/i.test(imageUrl)) {
    failures.push("og:image must not be a favicon");
  }

  return { ok: failures.length === 0, failures };
}

export function assertShareHtml(html, options = {}) {
  const result = validateShareHtml(html, options);
  if (!result.ok) {
    throw new Error(`Share meta contract failed:\n- ${result.failures.join("\n- ")}`);
  }
  return result;
}
