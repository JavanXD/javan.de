/**
 * Shared document chrome meta for *.javan.de (theme-color + color-scheme).
 */

export const DEFAULT_THEME_COLOR = "#050505";
export const DEFAULT_COLOR_SCHEME = "dark";

/**
 * @param {object} [input]
 * @param {string} [input.themeColor] default #050505
 * @param {string} [input.colorScheme] default dark
 * @returns {string} HTML meta tags
 */
export function chromeHeadTags(input = {}) {
  const themeColor = input.themeColor ?? DEFAULT_THEME_COLOR;
  const colorScheme = input.colorScheme ?? DEFAULT_COLOR_SCHEME;
  return `    <meta name="theme-color" content="${escapeAttr(themeColor)}">
    <meta name="color-scheme" content="${escapeAttr(colorScheme)}">`;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}
