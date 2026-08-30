# www.javan.de

Working queue for the arcade landing Worker that sits in front of WordPress on `javan.de` / `www.javan.de`.

## Current / next / ops

- **Now:** Landing cutover is live. Worker serves arcade assets on `/`; WP origin for `/wp-*` (login/admin kept); XML-RPC + fingerprint paths edge-404. Favicon/CSP/www-redirect/OG live.
- **Next:** Search Console — submit apex sitemap. Refresh Facebook Sharing Debugger / WhatsApp cache after OG change.
- **Later:** Dependabot merges (handled separately); WordPress privacy / publish webhook for blog sync stays in `blog.javan.de`. Cross-host SEO/favicon follow-ups from 2026-08-29 audit (other repos — see below).
- **Ops:** Always land on `main`. No feature branches or PRs for this repo except Dependabot. Never attach this Worker as a Cloudflare **custom domain** on apex/www.

## Needs your decision

- [ ] GitHub Advanced Security. Code scanning and secret scanning are off. Useful later; not blocking the landing.
- [ ] Search Console: submit `https://javan.de/sitemap.xml` (and/or keep www if already registered). Prefer apex to match canonical tags.
- [x] `training.javan.de` is `noindex` + `robots.txt` Disallow — **leave as-is.** Confirmed intentional soft-private: training hub delivers class-code / attendee-pack materials (`~/Training/training-hub`, private `javan-training/training.javan.de`); README + Worker set `X-Robots-Tag` / meta robots / `Disallow: /` by design. Do not open for indexing without an explicit product decision.
- [x] **High — `cf-relay.javan.de` open proxy on `*.javan.de`.** Decision (2026-08-30): **Move cf-relay off `*.javan.de` to its own domain** — an open HTTP proxy on this zone bypasses zone security protections (WAF/Access/etc.). Do **not** disable the public proxy in place without that cutover. Implementation tracked unchecked in `~/Projects/cf-edge-request-relay/TODO.md`.
- [ ] Keep shared edge Worker `javan-gh-pages-headers` (routes: tt-cheatsheet, conference-tracker, aroundtheworld) long-term vs migrate those origins to Cloudflare Pages/`_headers`? Source: `workers/javan-gh-pages-headers/`.

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
- [x] `og:image` / `twitter:image` → `https://javan.de/favicon-192.png` (summary card; square mark). *(deployed; superseded by large card below)*
- [x] Dedicated 1200×630 share JPEG + `twitter:card=summary_large_image`. *(`og-image.jpg` arcade Blinky card; meta + routing + build/validate; deployed via Actions run 33261540488)*

## Cross-host audit index (2026-08-29)

Canvas: `/Users/javan/.cursor/projects/Users-javan-Projects-www-javan-de/canvases/external-security-audit.canvas.tsx`

### Pass (do not regress)

- [x] **javan.de / www.javan.de** — hygiene Pass for headers/favicon/OG path; WP login/xmlrpc by design (Warn tracked below).
- [x] **projects.javan.de** — baseline headers 2026-08-29.
- [x] **blog.javan.de** — favicon.ico + homepage PNG `og:image` shipped; optional CSP still open in `blog.javan.de/TODO.md`.
- [x] **about.javan.de** — favicon.ico + Worker headers.
- [x] **newsletter → unagentic.javan.de** — intentional 301; unagentic headers Pass.
- [x] **algocue.javan.de** — was Pass on headers; PNG OG + favicon.ico added 2026-08-29 (`LeetCodeTrainer`).
- [x] **training.javan.de** — intentional noindex (decision above).

### Hygiene shipped this session

- [x] **tt-cheatsheet.javan.de** — favicon + PNG OG + Referrer/XFO via `javan-gh-pages-headers`; 2026-08-30 follow-up: exclude `TODO.md` from public site, real `favicon-192.png` (stop using OG as icon), strip GH Pages `Access-Control-Allow-Origin: *` at edge (`TrustedTypes-Cheatsheet`).
- [x] **aroundtheworld.javan.de** — Referrer/XFO via Worker; `og:image` PNG injected when missing (existing travel PNG).
- [x] **luna.javan.de** — PNG `og:image` + `/favicon.ico` (`Luna/web`).
- [x] **flights.javan.de** — real `/favicon.ico`; probe paths hard 404 (`FlightMap`).
- [x] **conference-tracker.javan.de** — Referrer/XFO via Worker; root `/favicon.ico`.
- [x] **cf-relay.javan.de** — real PNG OG; framing/Referrer headers; robots/sitemap. *(own-domain move decided — see below)*

### Security findings (track)

- [x] No accidental `.env` / `.git` / backup secret dumps across hosts (2026-08-29 probes).
- [ ] **High — Move cf-relay off `*.javan.de` to its own domain** (open proxy bypasses zone security protections). Next: pick domain → DNS + CF zone → update clients → decommission `cf-relay.javan.de`. Details: `~/Projects/cf-edge-request-relay/TODO.md`. Do not disable proxy until cutover.
- [x] Warn: WP login / xmlrpc / readme on **javan.de** + **aroundtheworld** — by design? Disable xmlrpc / fingerprint files if unused (Medium). *(2026-08-30: edge 404 for `/xmlrpc.php`, `/readme.html`, `/license.txt`, `/wp-admin/install.php`, `/wp-admin/setup-config.php` via `www-javan` Worker + `javan-gh-pages-headers` for ATW. `/wp-login.php` + `/wp-admin/` still origin.)*
- [x] Warn/Low: missing CSP on **blog** / **luna** (optional). *(enforcing CSP shipped 2026-08-30; also tt-cheatsheet + conference-tracker via edge Worker; cf-relay HTML UI only)*
- [x] Low: `Access-Control-Allow-Origin: *` on **flights** — drop if unused. *(FlightMap Pages Function middleware strips ACAO on `/*`; tt-cheatsheet + conference-tracker + aroundtheworld already stripped via `javan-gh-pages-headers`)*

### Repo TODO paths

| Host | Repo TODO |
|------|-----------|
| javan.de (index) | `~/Projects/www.javan.de/TODO.md` |
| tt-cheatsheet | `~/Projects/TrustedTypes-Cheatsheet/TODO.md` |
| conference-tracker | `~/Projects/ConferenceTracker/TODO.md` |
| luna | `~/Projects/Luna/TODO.md` |
| algocue | `~/Projects/LeetCodeTrainer/TODO.md` |
| flights | `~/Projects/FlightMap/TODO.md` |
| cf-relay | `~/Projects/cf-edge-request-relay/TODO.md` |
| blog / about / projects / newsletter | respective `*/TODO.md` (Pass items already checked) |

## Out of scope

- Merging Dependabot PRs (another agent).
- Changing WordPress content trees (except edge header/OG injection for aroundtheworld).
- Attaching the arcade Worker as a Cloudflare **custom domain** on `javan.de` / `www.javan.de`.
- Silently disabling cf-relay public proxy before the own-domain cutover.