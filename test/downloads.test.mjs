import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sumDownloads, payload, fetchAllReleases, getDownloads, formatCount, downloadsMarkup, THRESHOLD } from '../worker/downloads.js';

const rel = (assets, extra = {}) => ({ draft: false, prerelease: false, assets, ...extra });
const asset = (name, download_count) => ({ name, download_count });

test('sums .dmg, .deb and .rpm across published releases only', () => {
  const total = sumDownloads([
    rel([asset('CrewKite-macOS-arm64.dmg', 100), asset('crewkite_amd64.deb', 20), asset('crewkite.aarch64.rpm', 5), asset('SHA256SUMS', 900), asset('release.json', 900)]),
    rel([asset('CrewKite-macOS-arm64.dmg', 1000)], { draft: true }),
    rel([asset('CrewKite-macOS-arm64.dmg', 1000)], { prerelease: true }),
    rel([asset('crewkite_arm64.deb', 7), asset('crewkite.x86_64.rpm', 3)]),
  ]);
  assert.equal(total, 135);
});

test('the threshold edge: 249 is hidden, 250 is visible', () => {
  assert.equal(THRESHOLD, 250);
  assert.deepEqual(payload(249, 'x'), { visible: false });
  assert.deepEqual(payload(250, '2026-11-04T00:00:00.000Z'), { visible: true, total: 250, asOf: '2026-11-04T00:00:00.000Z' });
  assert.equal(downloadsMarkup(payload(249, 'x')), '');
});

test('pages through every release until a short page', async () => {
  const pages = [];
  const fetchFn = async (url) => {
    const page = Number(new URL(url).searchParams.get('page'));
    pages.push(page);
    const n = page < 3 ? 100 : 7;
    return new Response(JSON.stringify(Array.from({ length: n }, () => rel([asset('a.dmg', 1)]))));
  };
  const all = await fetchAllReleases(fetchFn, 'o/r', {});
  assert.deepEqual(pages, [1, 2, 3]);
  assert.equal(sumDownloads(all), 207);
});

test('a GitHub error fails the page fetch', async () => {
  await assert.rejects(fetchAllReleases(async () => new Response('', { status: 502 }), 'o/r', {}));
});

const memStore = () => {
  const m = new Map();
  return { m, get: async (k) => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); } };
};

test('serves the last good value marked stale when GitHub fails', async () => {
  const store = memStore();
  const now = () => new Date('2026-11-04T00:00:00Z');
  const first = await getDownloads({ store, now, load: async () => 812 });
  assert.deepEqual(first, { visible: true, total: 812, asOf: '2026-11-04T00:00:00.000Z' });
  store.m.delete('downloads-fresh'); // the five-minute copy expired
  const second = await getDownloads({ store, now, load: async () => { throw new Error('502'); } });
  assert.deepEqual(second, { visible: true, total: 812, asOf: '2026-11-04T00:00:00.000Z', stale: true });
});

test('with no cached value a failure is hidden', async () => {
  const out = await getDownloads({ store: memStore(), load: async () => { throw new Error('502'); } });
  assert.deepEqual(out, { visible: false });
});

test('a fresh value skips GitHub', async () => {
  const store = memStore();
  await store.put('downloads-fresh', { total: 300, asOf: 't' });
  const out = await getDownloads({ store, load: async () => { throw new Error('should not load'); } });
  assert.equal(out.total, 300);
});

test('formats in the locale, with k from 10,000', () => {
  assert.equal(formatCount(1234, 'en'), '1,234');
  assert.equal(formatCount(1234, 'de'), '1.234');
  assert.equal(formatCount(12437, 'en'), '12.4k');
  assert.equal(formatCount(12437, 'de'), '12,4k');
});
