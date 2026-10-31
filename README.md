# crewkite.dev

The website for [CrewKite](https://github.com/rjk6831/crewkite). It is a static Astro site served by one Cloudflare Worker with static assets.

## What runs where

- `src/` holds the pages. Astro builds them to plain HTML and CSS with no framework code in the browser.
- `public/site.js` is the only script on the page: the theme toggle, copy buttons, section reveals and the two replays. Every page works without it.
- `worker/index.js` serves the build and adds what a static file cannot:
  - `/api/latest` reads the latest GitHub release and its `SHA256SUMS` and caches the result for ten minutes. It falls back to version 0.1.0 when GitHub has no release.
  - `/api/stars` returns the repository star count with the same cache.
  - `/latest` redirects to the right download for the visitor's platform.
  - `/docs` and `/changelog` redirect to the repository.
  - crewkite.app, www.crewkite.app and www.crewkite.dev redirect to crewkite.dev with the path kept.
  - Pages get the version, release date, file sizes, checksums and star count written in at the edge, so they show on first paint with no request from the browser.
  - Every response carries the security headers. The CSP allows only the inline theme script by hash, which `scripts/postbuild.mjs` computes at build time.

The GitHub API allows 60 unauthenticated calls an hour per IP, and Worker egress IPs are shared. Set a fine-grained, read-only token as the `GITHUB_TOKEN` secret (`npx wrangler secret put GITHUB_TOKEN`) to lift that limit. Without it, the release lookup falls back to the `releases/latest` redirect, the `SHA256SUMS` file and a HEAD request per file, which needs no API call but has no release date, and the star count stays hidden.

Downloads link to fixed asset names under `releases/latest/download/` on GitHub. The site never hosts a binary.

## Develop

```sh
npm install
npm run build
npx wrangler dev
```

`npm run check` runs the copy rules over the built pages.

## Deploy

```sh
npm run deploy
```

Until the first full release is published on GitHub, the site runs on its workers.dev URL only. On release day, add the four hostnames to `wrangler.jsonc` and deploy again:

```jsonc
"routes": [
  { "pattern": "crewkite.dev", "custom_domain": true },
  { "pattern": "www.crewkite.dev", "custom_domain": true },
  { "pattern": "crewkite.app", "custom_domain": true },
  { "pattern": "www.crewkite.app", "custom_domain": true }
]
```

Both zones must be in the same Cloudflare account, with no existing DNS records on those four names.

## License

Apache License 2.0. See [LICENSE](LICENSE).
