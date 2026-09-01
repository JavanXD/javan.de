# javan.de

Arcade landing page for `javan.de` / `www.javan.de`, plus the root sitemap
index and sitemap submission automation.

## How production traffic is split

The Worker **does not** become the origin. `javan.de` stays an orange-cloud A
record to WordPress (`87.106.157.205`). The Worker is attached with **zone
routes** (`javan.de/*`, `www.javan.de/*`) so it runs in front of that origin.

| Path | What happens |
| --- | --- |
| `/`, landing assets, sitemaps, `robots.txt` | Arcade page from this repo |
| Known article slugs | 301 → `https://blog.javan.de/{slug}/` |
| `/feed/`, `/rss/`, `?feed=rss2` | 301 → `https://blog.javan.de/feed.xml` |
| `/wp-login.php`, `/wp-admin/`, `/wp-*` | Passed through to WordPress |
| Unknown permalinks | Passed through so new drafts still work |
| `/zoom`, `/meet`, `/secure-coding`, `/csslp` | 301/302 from this Worker (frees zone Single Redirect slots for host cutovers) |

**Never** attach this Worker as a Cloudflare **custom domain** on `javan.de`
or `www.javan.de`. That replaces the DNS origin and would take WordPress,
login, and RSS offline.

`blog.javan.de` is a separate Worker (`blog-javan`) and is not changed here.

## What this setup does

- Generates:
  - `public/sitemap.xml` (sitemap index; also references `projects.javan.de/sitemap.xml`)
  - `public/sitemap-main.xml` (root pages)
  - `public/sitemap-subdomains.xml` (subdomains and major sites)
  - `public/robots.txt` with sitemap reference
- Runs a weekly + manual GitHub Action to refresh and submit sitemap pings to
  Google and Bing.

### Dynamic data, not just a date stamp

`scripts/generate-sitemaps.mjs` doesn't just stamp every URL with today's
date. For each URL in `config/sitemap-links.json` it makes a live HTTP
request and:

- follows redirects, then reads the page's own
  `<link rel="canonical" href="...">` tag and uses that URL instead, so a
  URL that now canonicalizes elsewhere (e.g. a mirrored article, or a
  `www` redirecting to the apex domain) is listed under its real canonical
  address instead of the stale one in config;
- drops any entry whose (canonical) URL was already listed by an earlier
  section — `rootPages` > `subdomainPages` — so the same page never appears
  twice in the sitemap just because it's referenced from more than one list,
  or because a redirect/mirror made two entries resolve to the same place;
- uses the real `Last-Modified` response header as `<lastmod>` when the
  server provides one, falling back to today's date otherwise;
- drops subdomain URLs that come back non-2xx or unreachable, so dead links
  fall out of the sitemap automatically instead of lingering;
- always keeps `rootPages` (apex `javan.de`) even on a transient
  failure, since this is the site the workflow itself runs from.

The list of *which* URLs to check is still maintained by hand in
`config/sitemap-links.json` — there's no API access configured to
auto-discover subdomains (e.g. via DNS/Cloudflare or GitHub Pages custom
domains), so adding a new subdomain still requires a config edit.

## Local usage

```bash
npm install
npm test
npm run build:assets
npm run validate
npm run deploy
npm run smoke
npm run generate:sitemap
npm run submit:sitemap
```

## Updating URLs

Edit the URL lists in `config/sitemap-links.json`:

- `rootPages`
- `subdomainPages`
- `externalSitemaps`

Each is a plain array of URL strings — `lastmod` is resolved automatically
at build time, so there's nothing else to edit. Then run `npm run build`
and commit changes.

## Automated maintenance (no human intervention required)

This is a solo-maintained repo, so it's set up to keep itself current safely:

- **`.github/dependabot.yml`** — opens weekly PRs to bump npm dependencies
  and GitHub Actions versions used in workflows.
- **`.github/workflows/ci.yml`** — runs on every PR and push to `main`:
  installs deps, runs `npm audit --audit-level=high`, `npm test`, sitemap
  generation, and landing-asset validation. This is the check the
  auto-merge workflow waits on.
- **`.github/workflows/deploy.yml`** — deploys the landing Worker from
  `main` when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set.
- **`.github/workflows/dependabot-auto-merge.yml`** — auto-merges Dependabot
  PRs once CI passes, but **only** for patch/minor version bumps. Major
  version bumps are left open with a comment flagging them for manual
  review, since those are the ones most likely to contain breaking changes.
- **`.github/workflows/sitemap-indexing.yml`** — weekly (Mondays) rebuilds
  the sitemaps from live data and pings Google/Bing; commits changes back
  to `main` directly if anything changed.
- Repo-level `allow_auto_merge` and Dependabot security updates/alerts are
  enabled so vulnerable dependencies get patched automatically too.

Nothing here requires secrets beyond the default `GITHUB_TOKEN`, and major
upgrades always wait for a human — the goal is safe, low-noise upkeep, not
silent unattended risk-taking.
