/**
 * Canonical AI crawler Allow list for *.javan.de robots.txt.
 */
export const AI_CRAWLER_USER_AGENTS = Object.freeze([
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "Google-CloudVertexBot",
  "PerplexityBot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "cohere-ai",
  "meta-externalagent",
]);

/**
 * @param {{ allowPath?: string }} [opts]
 * @returns {string[]} lines (no trailing blank after last block)
 */
export function aiAllowBlocks({ allowPath = "/" } = {}) {
  const path = allowPath || "/";
  const lines = [];
  for (const ua of AI_CRAWLER_USER_AGENTS) {
    lines.push(`User-agent: ${ua}`, `Allow: ${path}`, "");
  }
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

/**
 * @param {object} opts
 * @param {string} opts.sitemap absolute sitemap URL
 * @param {string[]} [opts.disallow]
 * @param {string} [opts.allowPath] path Allowed for * and AI agents (default "/")
 * @param {string} [opts.starAllow] Allow line for User-agent * (default allowPath)
 * @param {string} [opts.preamble] optional comment block before User-agent *
 * @param {boolean} [opts.includeAi] default true
 * @returns {string} robots.txt body ending with newline
 */
export function buildRobotsTxt({
  sitemap,
  disallow = [],
  allowPath = "/",
  starAllow,
  preamble = "# Allow search engines and crawlers",
  includeAi = true,
} = {}) {
  if (!sitemap) throw new Error("buildRobotsTxt requires sitemap");
  const allow = starAllow ?? allowPath;
  const lines = [];
  if (preamble) lines.push(preamble);
  lines.push("User-agent: *", `Allow: ${allow}`);
  for (const rule of disallow) {
    lines.push(`Disallow: ${rule}`);
  }
  lines.push("");
  if (includeAi) {
    lines.push("# Explicitly allow AI crawlers and chat assistants");
    lines.push(...aiAllowBlocks({ allowPath }));
    lines.push("");
  }
  lines.push(`Sitemap: ${sitemap}`, "");
  return lines.join("\n");
}
