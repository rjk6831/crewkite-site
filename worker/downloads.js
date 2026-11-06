// The public download count. It sums GitHub's download_count over the installer assets (.dmg, .deb
// and .rpm) of every published release, drafts and prereleases left out. Nothing shows until the
// total reaches THRESHOLD, so the site never shows a small number as if it were proof of anything.
//
// Pure functions are exported for the tests in test/downloads.test.mjs; the Worker calls
// getDownloads() and downloadsMarkup().

export const THRESHOLD = 250;
export const FRESH_SECONDS = 300;
// The last good total is kept for a week, so a GitHub outage shows a slightly old number marked
// stale instead of making the count disappear and the row reflow.
export const STALE_SECONDS = 7 * 24 * 3600;
const INSTALLER = /\.(dmg|deb|rpm)$/i;
const PER_PAGE = 100;
const MAX_PAGES = 20;

export function sumDownloads(releases) {
  let total = 0;
  for (const r of releases || []) {
    if (!r || r.draft || r.prerelease) continue;
    for (const a of r.assets || []) {
      if (INSTALLER.test(a?.name || '')) total += Number(a.download_count) || 0;
    }
  }
  return total;
}

export function payload(total, asOf, stale = false) {
  if (!Number.isFinite(total) || total < THRESHOLD) return { visible: false };
  return { visible: true, total, asOf, ...(stale ? { stale: true } : {}) };
}

// Every page of /releases. GitHub returns at most 100 a page; a short page is the last one.
export async function fetchAllReleases(fetchFn, repo, headers) {
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetchFn(`https://api.github.com/repos/${repo}/releases?per_page=${PER_PAGE}&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub releases ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch)) throw new Error('GitHub releases: not a list');
    all.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return all;
}

// store is { get(key) -> value|null, put(key, value, ttlSeconds) }. The Worker passes one built on
// the Cache API; the tests pass a Map.
export async function getDownloads({ store, load, now = () => new Date() }) {
  const fresh = await store.get('downloads-fresh');
  if (fresh) return payload(fresh.total, fresh.asOf);
  try {
    const total = await load();
    const value = { total, asOf: now().toISOString() };
    await store.put('downloads-fresh', value, FRESH_SECONDS);
    await store.put('downloads-last', value, STALE_SECONDS);
    return payload(value.total, value.asOf);
  } catch {
    const last = await store.get('downloads-last');
    if (last) return payload(last.total, last.asOf, true);
    return { visible: false };
  }
}

// "1,234" in the visitor's locale; from 10,000 up, "12.4k".
export function formatCount(n, locale = 'en') {
  let nf;
  try {
    nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  } catch {
    nf = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
  }
  if (n >= 10000) return `${nf.format(Math.floor(n / 100) / 10)}k`;
  return nf.format(Math.round(n));
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// The inside of a [data-downloads] slot when the count is visible. The number gets a min-width in
// ch with tabular figures, so the count-up from 0 never moves anything beside it. The visible text is
// hidden from screen readers; a separate line carries the full sentence, and site.js turns it into a
// polite live region for the first render only.
export function downloadsMarkup(p, locale = 'en') {
  if (!p?.visible) return '';
  const text = formatCount(p.total, locale);
  return (
    `<span class="dlc-v" aria-hidden="true"><span class="dlc-n" data-total="${p.total}" style="min-width:${text.length}ch">${esc(text)}</span> downloads</span>` +
    `<span class="sr" data-downloads-sr>${esc(text)} downloads</span>`
  );
}

// The first language the browser asks for, if Intl knows it.
export function localeOf(acceptLanguage) {
  const tag = String(acceptLanguage || '').split(',')[0].split(';')[0].trim();
  try {
    return tag && Intl.NumberFormat.supportedLocalesOf([tag]).length ? tag : 'en';
  } catch {
    return 'en';
  }
}
