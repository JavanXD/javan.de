/**
 * Shared 1200×630 Open Graph / WhatsApp share card for *.javan.de.
 * Dark arcade + bronze grid; sites fill title, description, chip, accent.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import defaults from "./defaults.json" with { type: "json" };

export const OG_WIDTH = defaults.ogWidth;
export const OG_HEIGHT = defaults.ogHeight;

export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function wrapText(value, maximumCharacters, maximumLines) {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maximumCharacters || !line) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
  }
  if (line) lines.push(line);

  if (lines.length > maximumLines) {
    lines.length = maximumLines;
    lines[maximumLines - 1] = `${lines[maximumLines - 1].replace(/[.,;:]?$/, "")}…`;
  }
  return lines;
}

function textLines(lines, { x, y, size, lineHeight, weight = 400, fill = "#f4f1e9" }) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(line)}</text>`,
    )
    .join("");
}

/**
 * @param {object} options
 * @param {string} [options.hostKey] key in defaults.hosts
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {string} [options.chip]
 * @param {string} [options.accent]
 * @param {string} [options.domain]
 * @param {string} [options.siteName]
 */
export function resolveCardOptions(options = {}) {
  const host = options.hostKey ? defaults.hosts[options.hostKey] : null;
  if (options.hostKey && !host) {
    throw new Error(`Unknown social hostKey: ${options.hostKey}`);
  }
  const title = options.title ?? host?.title ?? "Javan Rasokat";
  const description = options.description ?? host?.description ?? "";
  const chip = (options.chip ?? host?.chip ?? "home").toUpperCase();
  const accent = options.accent ?? host?.accent ?? "#d4a574";
  const domain = (options.domain ?? host?.domain ?? "javan.de").toUpperCase();
  const siteName = options.siteName ?? host?.siteName ?? domain.toLowerCase();
  return { title, description, chip, accent, domain, siteName, host };
}

export function renderShareCardSvg(options = {}) {
  const { title, description, chip, accent, domain } = resolveCardOptions(options);
  const titleLines = wrapText(title, 22, 2);
  const descriptionLines = wrapText(description, 52, 3);
  const titleY = titleLines.length === 1 ? 268 : 228;
  const descriptionY = titleLines.length === 1 ? 348 : 378;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="82%" cy="18%" r="70%">
      <stop offset="0" stop-color="${escapeXml(accent)}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#050505" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warm" cx="10%" cy="90%" r="50%">
      <stop offset="0" stop-color="#ffd400" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#050505" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#050505"/>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#glow)"/>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#warm)"/>
  <rect x="620" width="580" height="${OG_HEIGHT}" fill="url(#grid)"/>
  <path d="M52 52H1148V578H52Z" fill="none" stroke="#ffffff" stroke-opacity="0.1"/>
  <path d="M52 118H760" stroke="${escapeXml(accent)}" stroke-opacity="0.65"/>
  <rect x="52" y="84" width="10" height="10" fill="${escapeXml(accent)}"/>
  <text x="82" y="96" fill="#aaa69e" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="17" letter-spacing="3">${escapeXml(chip)}</text>
  ${textLines(titleLines, { x: 52, y: titleY, size: 64, lineHeight: 72, weight: 800 })}
  ${textLines(descriptionLines, { x: 56, y: descriptionY, size: 24, lineHeight: 36, fill: "#aaa69e" })}
  <rect x="52" y="500" width="280" height="44" rx="2" fill="${escapeXml(accent)}"/>
  <text x="72" y="530" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">${escapeXml(domain)}</text>
  <text x="1144" y="530" text-anchor="end" fill="${escapeXml(accent)}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="16" letter-spacing="2">JAVAN.DE</text>
</svg>`;
}

/**
 * Write a PNG share card. Requires `sharp` (peer / site dependency).
 * @param {string|URL} outPath
 * @param {object} [options] same as renderShareCardSvg
 */
export async function writeShareCard(outPath, options = {}) {
  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    throw new Error("writeShareCard requires the sharp package in the calling site");
  }
  const svg = renderShareCardSvg(options);
  const target = typeof outPath === "string" ? outPath : fileURLToPath(outPath);
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(target);
  return target;
}

export async function loadHostDefaults(hostKey) {
  const host = defaults.hosts[hostKey];
  if (!host) throw new Error(`Unknown social hostKey: ${hostKey}`);
  return host;
}

export function absoluteImageUrl(hostKey, imagePath) {
  const host = defaults.hosts[hostKey];
  if (!host) throw new Error(`Unknown social hostKey: ${hostKey}`);
  const path = imagePath ?? host.imagePath ?? "/og-image.png";
  if (/^https?:\/\//i.test(path)) return path;
  return `${host.origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Convenience: read package-local defaults without JSON import assert issues in older tools */
export async function readDefaultsFile() {
  const url = new URL("./defaults.json", import.meta.url);
  return JSON.parse(await readFile(url, "utf8"));
}
