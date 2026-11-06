import { CSP_SCRIPT_HASHES } from './csp.generated.js';
import { getDownloads, fetchAllReleases, sumDownloads, downloadsMarkup, localeOf, payload } from './downloads.js';

const CANONICAL = 'crewkite.dev';
const REPO = 'rjk6831/crewkite';
const REPO_URL = `https://github.com/${REPO}`;
const DL = `${REPO_URL}/releases/latest/download`;
const FALLBACK_VERSION = '0.1.0';
const TTL = 600;

const ASSETS = {
  mac: 'CrewKite-macOS-arm64.dmg',
};

const REDIRECTS = {
  '/docs': `${REPO_URL}#documentation`,
  '/changelog': `${REPO_URL}/blob/main/CHANGELOG.md`,
  '/download/macos': '/download#macos',
  '/download/linux': '/download#linux',
  '/download/windows': '/download#windows',
};

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    `script-src 'self' ${CSP_SCRIPT_HASHES.map((h) => `'${h}'`).join(' ')} https://static.cloudflareinsights.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; '),
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // crewkite.app, www.crewkite.app and www.crewkite.dev all land on the canonical host with the path kept.
    const host = url.hostname;
    if (host === 'crewkite.app' || host === 'www.crewkite.app' || host === `www.${CANONICAL}`) {
      return Response.redirect(`https://${CANONICAL}${url.pathname}${url.search}`, 301);
    }

    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (REDIRECTS[path]) {
      const to = REDIRECTS[path];
      return Response.redirect(to.startsWith('/') ? new URL(to, url).href : to, to.startsWith('/') ? 301 : 302);
    }

    if (path === '/api/latest' || path === '/api/release') {
      const rel = await getRelease(ctx, env);
      return json(rel);
    }
    if (path === '/api/downloads') {
      return json(await downloads(request, ctx, env), 300);
    }
    if (path === '/latest') {
      return Response.redirect(latestFor(request.headers.get('user-agent') || ''), 302);
    }

    const res = await env.ASSETS.fetch(request);
    const type = res.headers.get('content-type') || '';
    const out = type.includes('text/html') ? await rewrite(res, request, ctx, env) : new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
    // The workers.dev preview stays out of search results; only crewkite.dev gets indexed.
    if (host.endsWith('.workers.dev')) out.headers.set('X-Robots-Tag', 'noindex');
    if (/\.(woff2|webp|png|svg)$/.test(path)) out.headers.set('Cache-Control', 'public, max-age=2592000');
    else if (path.endsWith('.js')) out.headers.set('Cache-Control', 'public, max-age=3600');
    return out;
  },
};

function json(body, ttl = TTL) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${ttl}`,
      'access-control-allow-origin': '*',
      ...SECURITY_HEADERS,
    },
  });
}

function platformOf(ua) {
  if (/Windows/i.test(ua)) return 'windows';
  if (/Android|iPhone|iPad/i.test(ua)) return 'other';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'mac';
  if (/Linux|X11/i.test(ua)) return /aarch64|arm64/i.test(ua) ? 'linux-arm' : 'linux';
  return 'other';
}

function latestFor(ua) {
  const p = platformOf(ua);
  if (p === 'mac') return `${DL}/${ASSETS.mac}`;
  if (p === 'linux' || p === 'linux-arm') return `https://${CANONICAL}/download#linux`;
  return `https://${CANONICAL}/download`;
}

// Cached through the Cache API for ten minutes so the GitHub API sees a few calls an hour at most.
async function cached(key, ctx, load) {
  const cache = caches.default;
  const req = new Request(`https://${CANONICAL}/__cache/${key}`);
  const hit = await cache.match(req);
  if (hit) return hit.json();
  let value;
  try {
    value = await load();
  } catch {
    value = null;
  }
  if (value) {
    const res = new Response(JSON.stringify(value), { headers: { 'cache-control': `public, max-age=${TTL}` } });
    ctx.waitUntil(cache.put(req, res));
  }
  return value;
}

// A read-only token is optional. Without one the API allows 60 calls an hour per egress IP, and
// Cloudflare egress IPs are shared, so the release lookup also has a path that skips the API.
const gh = (env) => ({
  'user-agent': 'crewkite.dev',
  accept: 'application/vnd.github+json',
  ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
});

async function parseSums(res) {
  const sums = {};
  if (!res.ok) return sums;
  for (const line of (await res.text()).split('\n')) {
    const m = line.trim().match(/^([0-9a-f]{64})\s+\*?(.+)$/i);
    if (m) sums[m[2].trim()] = m[1].toLowerCase();
  }
  return sums;
}

// Without the API: the tag comes from the releases/latest redirect, checksums from SHA256SUMS and
// sizes from a HEAD on each listed file. No release date on this path.
async function releaseWithoutApi() {
  const head = await fetch(`${REPO_URL}/releases/latest`, { redirect: 'manual', headers: { 'user-agent': 'crewkite.dev' } });
  const loc = head.headers.get('location') || '';
  const tag = loc.match(/\/releases\/tag\/([^/?#]+)/)?.[1];
  if (!tag) return null;
  const sums = await parseSums(await fetch(`${DL}/SHA256SUMS`, { headers: { 'user-agent': 'crewkite.dev' } }));
  const assets = await Promise.all(
    Object.keys(sums).map(async (name) => {
      const h = await fetch(`${DL}/${name}`, { method: 'HEAD', headers: { 'user-agent': 'crewkite.dev' } });
      const size = Number(h.headers.get('content-length')) || null;
      return { name, size, sha256: sums[name], url: `${DL}/${name}` };
    }),
  );
  return {
    version: decodeURIComponent(tag).replace(/^v/, ''),
    date: null,
    notesUrl: `${REPO_URL}/releases/tag/${tag}`,
    notarized: false,
    assets,
  };
}

async function getRelease(ctx, env) {
  const rel = await cached('release-v3', ctx, async () => {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: gh(env) });
    if (r.status === 404) return null;
    if (!r.ok) return releaseWithoutApi();
    const data = await r.json();
    const sumAsset = data.assets?.find((a) => a.name === 'SHA256SUMS');
    const sums = sumAsset ? await parseSums(await fetch(sumAsset.browser_download_url, { headers: { 'user-agent': 'crewkite.dev' } })) : {};
    // release.json is the release receipt. It says whether the macOS build is notarized and, when
    // it records one, the minimum macOS version. The page claims neither without it.
    let notarized = false;
    let minMacos = null;
    const receipt = data.assets?.find((a) => a.name === 'release.json');
    if (receipt) {
      const t = await fetch(receipt.browser_download_url, { headers: { 'user-agent': 'crewkite.dev' } });
      if (t.ok) {
        const j = await t.json().catch(() => ({}));
        notarized = j?.notarized === true || j?.signing?.notarized === true || j?.macos?.notarized === true;
        const m = j?.macos?.minimumVersion ?? j?.macos?.minimumOS ?? j?.minimumMacOS ?? j?.minimumSystemVersion;
        if (typeof m === 'string' && /^\d+(\.\d+){0,2}$/.test(m)) minMacos = m;
      }
    }
    return {
      version: String(data.tag_name || '').replace(/^v/, '') || FALLBACK_VERSION,
      date: data.published_at || null,
      notesUrl: data.html_url,
      notarized,
      minMacos,
      assets: (data.assets || [])
        .filter((a) => a.name !== 'SHA256SUMS' && a.name !== 'release.json')
        .map((a) => ({ name: a.name, size: a.size, sha256: sums[a.name] || null, url: `${DL}/${a.name}` })),
    };
  });
  return rel || { version: FALLBACK_VERSION, date: null, notesUrl: `${REPO_URL}/releases`, notarized: false, minMacos: null, assets: [], fallback: true };
}

// The download total, fresh for five minutes, with the last good value kept as a stale fallback.
// DOWNLOADS_TEST_TOTAL forces a total for screenshots and tests; it is ignored on crewkite.dev.
async function downloads(request, ctx, env) {
  const host = new URL(request.url).hostname;
  if (env.DOWNLOADS_TEST_TOTAL && host !== CANONICAL) {
    return payload(Number(env.DOWNLOADS_TEST_TOTAL), new Date().toISOString());
  }
  const cache = caches.default;
  const keyOf = (k) => new Request(`https://${CANONICAL}/__cache/${k}`);
  const store = {
    get: async (k) => {
      const hit = await cache.match(keyOf(k));
      return hit ? hit.json() : null;
    },
    put: async (k, v, ttl) => {
      const res = new Response(JSON.stringify(v), { headers: { 'cache-control': `public, max-age=${ttl}` } });
      ctx.waitUntil(cache.put(keyOf(k), res));
    },
  };
  return getDownloads({ store, load: async () => sumDownloads(await fetchAllReleases(fetch, REPO, gh(env))) });
}

const fmtSize = (b) => `${(b / 1e6).toFixed(1)} MB`;
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Release facts and the platform button go into the HTML at the edge, so the page shows them on
// first paint with no client request and no layout shift.
async function rewrite(res, request, ctx, env) {
  const [rel, dl] = await Promise.all([getRelease(ctx, env), downloads(request, ctx, env)]);
  const locale = localeOf(request.headers.get('accept-language'));
  const byName = Object.fromEntries(rel.assets.map((a) => [a.name, a]));
  const platform = platformOf(request.headers.get('user-agent') || '');

  let r = new HTMLRewriter()
    .on('[data-release="version"]', { element: (e) => e.setInnerContent(rel.version) })
    .on('[data-release="date-line"]', {
      element: (e) => {
        if (!rel.date) return;
        e.removeAttribute('hidden');
        e.setInnerContent(`Released ${fmtDate(rel.date)}`);
      },
    })
    .on('[data-size]', {
      element: (e) => {
        const a = byName[e.getAttribute('data-size')];
        if (a) e.setInnerContent(fmtSize(a.size));
      },
    })
    .on('[data-sha]', {
      element: (e) => {
        const a = byName[e.getAttribute('data-sha')];
        if (a?.sha256) e.setInnerContent(a.sha256);
      },
    })
    .on('[data-sha-row]', {
      element: (e) => {
        const a = byName[e.getAttribute('data-sha-row')];
        if (a?.sha256) e.removeAttribute('hidden');
      },
    })
    // The page renders the signing line from the release data; a published release.json that does
    // not say notarized takes it off.
    .on('[data-signing]', {
      element: (e) => {
        if (!rel.fallback && !rel.notarized) e.remove();
      },
    })
    .on('[data-min-macos]', {
      element: (e) => {
        if (!rel.minMacos) return;
        e.setInnerContent(`Needs macOS ${rel.minMacos} or later.`);
      },
    })
    .on('a[data-release="notes"]', { element: (e) => e.setAttribute('href', rel.notesUrl) })
    // Only builds the release actually carries. With no asset list (GitHub unreachable and no cache)
    // every block stays, so the page never comes up empty.
    .on('[data-asset]', {
      element: (e) => {
        if (rel.assets.length && !byName[e.getAttribute('data-asset')]) e.remove();
      },
    })
    .on('[data-downloads]', {
      element: (e) => {
        if (!dl.visible) return;
        e.removeAttribute('hidden');
        e.setAttribute('data-as-of', dl.asOf);
        e.setAttribute('title', `As of ${new Date(dl.asOf).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`);
        if (dl.stale) e.setAttribute('data-stale', '');
        e.setInnerContent(downloadsMarkup(dl, locale), { html: true });
      },
    });

  if (platform === 'linux' || platform === 'linux-arm') {
    r = r
      .on('a[data-dl]', { element: (e) => e.setAttribute('href', '/download#linux') })
      .on('[data-dl-label]', { element: (e) => e.setInnerContent('Download Linux preview') });
  } else if (platform === 'windows') {
    r = r.on('a[data-dl]', {
      element: (e) => e.replace('<span class="dl-note">Not supported yet. WSL2 is untested.</span>', { html: true }),
    });
  }

  const out = r.transform(res);
  const headers = new Headers(out.headers);
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Vary', 'User-Agent');
  return new Response(out.body, { status: res.status, headers });
}
