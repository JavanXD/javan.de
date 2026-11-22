#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const candidates = [
  process.env.JAVAN_WEB_ROOT,
  join(root, "..", "javan-personal-branding", "brand-system", "web"),
  join(process.env.HOME || "", "Projects", "javan-personal-branding", "brand-system", "web"),
].filter(Boolean);

const webRoot = candidates.find((p) => existsSync(join(p, "scripts", "copy.mjs")));
if (!webRoot) {
  console.error("Could not find @javan/web. Set JAVAN_WEB_ROOT or keep javan-personal-branding next to this repo.");
  process.exit(1);
}

const out = join(root, "vendor", "@javan", "web");
const result = spawnSync(process.execPath, [join(webRoot, "scripts", "copy.mjs"), "--out", out, "--css", "footer"], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
