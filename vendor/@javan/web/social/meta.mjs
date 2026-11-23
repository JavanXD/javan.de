/**
 * Required Open Graph + Twitter meta tags for *.javan.de share previews.
 */
import defaults from "./defaults.json" with { type: "json" };
import { OG_HEIGHT, OG_WIDTH, absoluteImageUrl, loadHostDefaults } from "./card.mjs";

export { OG_WIDTH, OG_HEIGHT };

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * @param {object} input
 * @param {string} [input.hostKey]
 * @param {string} [input.title]
 * @param {string} [input.description]
 * @param {string} [input.url] canonical page URL
 * @param {string} [input.imageUrl] absolute image URL (defaults to host /og-image.png)
 * @param {string} [input.imagePath] path under host origin when imageUrl omitted
 * @param {string} [input.imageAlt]
 * @param {string} [input.siteName]
 * @param {string} [input.type] og:type, default website
 * @param {string} [input.locale] default de_DE
 * @param {string} [input.imageType] default image/png
 * @param {boolean} [input.includeDimensions] default true (1200×630). Set false for non-template images.
 * @param {number} [input.imageWidth]
 * @param {number} [input.imageHeight]
 */
export function shareMetaTags(input = {}) {
  const host = input.hostKey ? defaults.hosts[input.hostKey] : null;
  if (input.hostKey && !host) {
    throw new Error(`Unknown social hostKey: ${input.hostKey}`);
  }

  const title = input.title ?? host?.title ?? "Javan Rasokat";
  const description = input.description ?? host?.description ?? "";
  const siteName = input.siteName ?? host?.siteName ?? "javan.de";
  const url = input.url ?? (host ? `${host.origin}/` : "https://javan.de/");
  const imageUrl =
    input.imageUrl ??
    (input.hostKey ? absoluteImageUrl(input.hostKey, input.imagePath) : null) ??
    "https://javan.de/og-image.jpg";
  const imageAlt = input.imageAlt ?? title;
  const type = input.type ?? "website";
  const locale = input.locale ?? "de_DE";
  const inferredType = /\.jpe?g(\?|$)/i.test(imageUrl)
    ? "image/jpeg"
    : /\.webp(\?|$)/i.test(imageUrl)
      ? "image/webp"
      : "image/png";
  const imageType = input.imageType ?? inferredType;
  const includeDimensions = input.includeDimensions !== false;
  const imageWidth = input.imageWidth ?? OG_WIDTH;
  const imageHeight = input.imageHeight ?? OG_HEIGHT;

  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(url);
  const img = escapeHtml(imageUrl);
  const alt = escapeHtml(imageAlt);
  const sn = escapeHtml(siteName);

  const dimensionTags = includeDimensions
    ? `
    <meta property="og:image:type" content="${escapeHtml(imageType)}">
    <meta property="og:image:width" content="${imageWidth}">
    <meta property="og:image:height" content="${imageHeight}">`
    : "";

  return `    <meta property="og:type" content="${escapeHtml(type)}">
    <meta property="og:locale" content="${escapeHtml(locale)}">
    <meta property="og:site_name" content="${sn}">
    <meta property="og:url" content="${u}">
    <meta property="og:title" content="${t}">
    <meta property="og:description" content="${d}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:secure_url" content="${img}">${dimensionTags}
    <meta property="og:image:alt" content="${alt}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${t}">
    <meta name="twitter:description" content="${d}">
    <meta name="twitter:image" content="${img}">
    <meta name="twitter:image:alt" content="${alt}">`;
}

export async function shareMetaForHost(hostKey, overrides = {}) {
  await loadHostDefaults(hostKey);
  return shareMetaTags({ hostKey, ...overrides });
}

/**
 * Next.js / Metadata API shape for the same share contract.
 * @param {Parameters<typeof shareMetaTags>[0]} input
 * @returns {object}
 */
export function shareMetadata(input = {}) {
  const host = input.hostKey ? defaults.hosts[input.hostKey] : null;
  if (input.hostKey && !host) {
    throw new Error(`Unknown social hostKey: ${input.hostKey}`);
  }

  const title = input.title ?? host?.title ?? "Javan Rasokat";
  const description = input.description ?? host?.description ?? "";
  const siteName = input.siteName ?? host?.siteName ?? "javan.de";
  const url = input.url ?? (host ? `${host.origin}/` : "https://javan.de/");
  const imageUrl =
    input.imageUrl ??
    (input.hostKey ? absoluteImageUrl(input.hostKey, input.imagePath) : null) ??
    "https://javan.de/og-image.png";
  const imageAlt = input.imageAlt ?? title;
  const type = input.type ?? "website";
  const locale = input.locale ?? "de_DE";
  const includeDimensions = input.includeDimensions !== false;
  const imageWidth = input.imageWidth ?? OG_WIDTH;
  const imageHeight = input.imageHeight ?? OG_HEIGHT;

  const images = [
    {
      url: imageUrl,
      secureUrl: imageUrl,
      alt: imageAlt,
      ...(includeDimensions ? { width: imageWidth, height: imageHeight } : {}),
      ...(input.imageType ? { type: input.imageType } : { type: "image/png" }),
    },
  ];

  return {
    title,
    description,
    metadataBase: host ? new URL(`${host.origin}/`) : new URL("https://javan.de/"),
    openGraph: {
      type,
      locale,
      siteName,
      url,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
