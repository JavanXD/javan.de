# www.javan.de

Working queue for the arcade landing Worker that sits in front of WordPress on `javan.de` / `www.javan.de`.

## Current / next / ops

- **Now:** Landing cutover is live. Worker serves arcade assets on `/` and known paths; known article slugs + RSS 301 to `blog.javan.de`; WordPress stays origin for `/wp-*` and unknown paths.
- **Next:** Search Console — submit apex sitemap after confirming both hosts serve it; optional favicon / OG smoke in Console.
- **Later:** Dependabot merges (handled separately); WordPress privacy / publish webhook for blog sync stays in `blog.javan.de`.
- **Ops:** Always land on `main`. No feature branches or PRs for this repo except Dependabot. Never attach this Worker as a Cloudflare **custom domain** on apex/www.

## Needs your decision

- [ ] GitHub Advanced Security. Code scanning and secret scanning are off. Useful later; not blocking the landing.
- [ ] Search Console: submit `https://javan.de/sitemap.xml` (and/or keep www if already registered). Prefer apex to match canonical tags.

## Cutover (done)

- [x] Worker routes in front of WordPress (`javan.de/*`, `www.javan.de/*`), not custom-domain origin.
- [x] Arcade landing assets from `dist/` for `/`, icons, robots, sitemaps.
- [x] Known article slugs + feed paths 301 → `blog.javan.de`.
- [x] Short links (`/zoom`, `/meet`, …) preserved in the Worker.
- [x] `/wp-login.php` and `/wp-admin/` pass through to WordPress origin.
- [x] Deploy from `main` via GitHub Actions + local wrangler when secrets exist.

## Polish

- [x] Add `favicon-192.png` (192×192 from `blinky.svg`) at repo root; copied by `build:assets`.
- [x] Canonical / OG / Twitter / JSON-LD prefer apex `https://javan.de/`.
- [x] Sitemap index + robots `Sitemap:` line use apex; `rootPages` is apex-only (`www` redirects to apex).
- [ ] Confirm live smoke: homepage, favicon-192, sitemap on both apex and www after this deploy.
- [ ] Optional: `og:image` pointing at a shareable PNG (none today; summary card only).

## Out of scope

- Merging Dependabot PRs (another agent).
- Changing `blog.javan.de` or WordPress content.
- Attaching the Worker as a custom domain on `javan.de` / `www.javan.de`.
