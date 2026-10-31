import { CSP_SCRIPT_HASHES } from './csp.generated.js';

const CANONICAL = 'crewkite.dev';
const REPO = 'rjk6831/crewkite';
const REPO_URL = `https://github.com/${REPO}`;
const DL = `${REPO_URL}/releases/latest/download`;
const FALLBACK_VERSION = '0.1.0';
const TTL = 600;

const ASSETS = {
  mac: 'CrewKite-macOS-arm64.dmg',
  appimageX64: 'CrewKite-linux-x86_64.AppImage',
  appimageArm: 'CrewKite-linux-arm64.AppImage',
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
    if (path === '/api/stars') {
      const stars = await getStars(ctx, env);
      return json({ stars });
    }
    if (path === '/latest') {
      return Response.redirect(latestFor(request.headers.get('user-agent') || ''), 302);
    }

    const res = await env.ASSETS.fetch(request);
    const type = res.headers.get('content-type') || '';
    const out = type.includes('text/html') ? await rewrite(res, request, ctx, env) : new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
    if (/\.(woff2|webp|png|svg)$/.test(path)) out.headers.set('Cache-Control', 'public, max-age=2592000');
    else if (path.endsWith('.js')) out.headers.set('Cache-Control', 'public, max-age=3600');
    return out;
  },
};

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${TTL}`,
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
  if (p === 'linux') return `${DL}/${ASSETS.appimageX64}`;
  if (p === 'linux-arm') return `${DL}/${ASSETS.appimageArm}`;
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
  const rel = await cached('release-v2', ctx, async () => {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: gh(env) });
    if (r.status === 404) return null;
    if (!r.ok) return releaseWithoutApi();
    const data = await r.json();
    const sumAsset = data.assets?.find((a) => a.name === 'SHA256SUMS');
    const sums = sumAsset ? await parseSums(await fetch(sumAsset.browser_download_url, { headers: { 'user-agent': 'crewkite.dev' } })) : {};
    let notarized = false;
    const receipt = data.assets?.find((a) => a.name === 'release.json');
    if (receipt) {
      const t = await fetch(receipt.browser_download_url, { headers: { 'user-agent': 'crewkite.dev' } });
      if (t.ok) {
        const j = await t.json().catch(() => ({}));
        notarized = j?.notarized === true || j?.signing?.notarized === true || j?.macos?.notarized === true;
      }
    }
    return {
      version: String(data.tag_name || '').replace(/^v/, '') || FALLBACK_VERSION,
      date: data.published_at || null,
      notesUrl: data.html_url,
      notarized,
      assets: (data.assets || [])
        .filter((a) => a.name !== 'SHA256SUMS' && a.name !== 'release.json')
        .map((a) => ({ name: a.name, size: a.size, sha256: sums[a.name] || null, url: `${DL}/${a.name}` })),
    };
  });
  return rel || { version: FALLBACK_VERSION, date: null, notesUrl: `${REPO_URL}/releases`, notarized: false, assets: [], fallback: true };
}

async function getStars(ctx, env) {
  const v = await cached('stars-v1', ctx, async () => {
    const r = await fetch(`https://api.github.com/repos/${REPO}`, { headers: gh(env) });
    if (!r.ok) return null;
    const d = await r.json();
    return typeof d.stargazers_count === 'number' ? { n: d.stargazers_count } : null;
  });
  return v ? v.n : null;
}

const fmtSize = (b) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${Math.round(b / 1e6)} MB`);
const fmtStars = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Release facts, star count and the platform button go into the HTML at the edge, so the page
// shows them on first paint with no client request and no layout shift.
async function rewrite(res, request, ctx, env) {
  const [rel, stars] = await Promise.all([getRelease(ctx, env), getStars(ctx, env)]);
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
    .on('[data-signing]', {
      element: (e) => {
        if (rel.notarized) e.setInnerContent('Developer ID, notarized');
      },
    });

  if (stars != null) {
    r = r
      .on('[data-stars]', {
        element: (e) => {
          e.removeAttribute('hidden');
          e.setInnerContent(fmtStars(stars));
        },
      })
      .on('[data-stars-row]', { element: (e) => e.removeAttribute('hidden') })
      .on('[data-stars-plain]', { element: (e) => e.setInnerContent(stars.toLocaleString('en-US')) });
  }

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
