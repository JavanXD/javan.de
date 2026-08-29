# www.javan.de

Working queue for the arcade landing Worker that sits in front of WordPress on `javan.de` / `www.javan.de`.

## Current / next / ops

- **Now:** Landing cutover is live. Worker serves arcade assets on `/` and known paths; known article slugs + RSS 301 to `blog.javan.de`; WordPress stays origin for `/wp-*` and unknown paths. `www` → apex 301 is handled in the Worker (plus optional zone Single Redirect). Favicon/CSP/www-redirect/`og:image`+`twitter:image` → `favicon-192.png` are live (Worker version `22cde974-0946-4b0b-a192-b738d1a0762d`).
- **Next:** Commit + deploy landing OG image tags; Search Console — submit apex sitemap.
- **Later:** Dependabot merges (handled separately); WordPress privacy / publish webhook for blog sync stays in `blog.javan.de`. Cross-host SEO/favicon follow-ups from 2026-08-29 audit (other repos — see below).
- **Ops:** Always land on `main`. No feature branches or PRs for this repo except Dependabot. Never attach this Worker as a Cloudflare **custom domain** on apex/www.

## Needs your decision

- [ ] GitHub Advanced Security. Code scanning and secret scanning are off. Useful later; not blocking the landing.
- [ ] Search Console: submit `https://javan.de/sitemap.xml` (and/or keep www if already registered). Prefer apex to match canonical tags.
- [x] `training.javan.de` is `noindex` + `robots.txt` Disallow — **leave as-is.** Confirmed intentional soft-private: training hub delivers class-code / attendee-pack materials (`~/Training/training-hub`, private `javan-training/training.javan.de`); README + Worker set `X-Robots-Tag` / meta robots / `Disallow: /` by design. Do not open for indexing without an explicit product decision.

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
- [x] `www.javan.de` → `javan.de` 301 in Worker (`decide`), preserving path + query; smoke requires 301. *(zone had no www rule; deploy token lacks Rules write — Single Redirect not added; Worker is sufficient with `run_worker_first`)*
- [x] Fix Firefox favicon: CSP `img-src 'self'` (Firefox enforces CSP on favicons; Chrome often does not) + `/favicon.ico` + absolute icon `href`s.
- [x] Fix stale `public/sitemap-main.xml` listing `https://www.javan.de/` → apex only.
- [x] Confirm live smoke: homepage, favicon, sitemap on apex; www 301 to apex. *(wrangler deploy + `npm run smoke` passed 2026-08-29)*
- [x] Homepage `<link rel="alternate" type="application/rss+xml">` → `https://blog.javan.de/feed.xml` for feed autodiscovery. *(was missing after cutover; old `/feed/` URLs still 301 correctly)*
- [x] `og:image` / `twitter:image` → `https://javan.de/favicon-192.png` (summary card; square mark). *(deployed; live HTML + HEAD 200 on asset)*
- [ ] Optional later: dedicated 1200×630 share PNG + `twitter:card=summary_large_image`.

## Cross-host audit follow-ups (other repos — report only)

Priority from 2026-08-29 favicon / headers / SEO / OG audit:

1. **blog.javan.de** — add `/favicon.ico` (+ HTML link); homepage lacks `og:image` (posts OK); consider CSP.
2. **flights.javan.de** — `/favicon.ico` returns HTML (SPA fallback); ship real ICO or exclude from navigation fallback (`FlightMap`).
3. **tt-cheatsheet.javan.de** — no favicon links; no `og:image`.
4. **luna / algocue** — `og:image` is SVG (many crawlers ignore); ship PNG/JPEG cards.
5. **about.javan.de** — SEO/OG/PNG icons OK live; missing only `/favicon.ico` (optional). Headers: HSTS + nosniff only (no CSP / Referrer-Policy / frame denial). → **Fixed 2026-08-29** in `about.javan.de` (favicon.ico + `run_worker_first` + Worker headers live).
6. **projects / conference-tracker / unagentic / cf-relay / aroundtheworld** — weak security header sets (no CSP / often no Referrer-Policy or XFO); cf-relay missing `twitter:card` + `og-image.png` served as SVG; aroundtheworld missing `og:image`. → **projects + unagentic fixed 2026-08-29**; others still open.
7. **newsletter.javan.de** — intentional 301 → `unagentic.javan.de` (sitemap dedupes).

## Out of scope

- Merging Dependabot PRs (another agent).
- Changing `blog.javan.de` or WordPress content.
- Attaching the Worker as a Cloudflare **custom domain** on `javan.de` / `www.javan.de`.
