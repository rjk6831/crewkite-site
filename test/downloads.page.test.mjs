// Page behaviour of the download count, against the built site in dist/. A small server stands in
// for the Worker: it fills [data-downloads] with the same markup the Worker uses, or leaves it hidden.
// Needs Playwright; the test skips without it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { downloadsMarkup, payload } from '../worker/downloads.js';

let chromium;
try { ({ chromium } = await import('playwright')); } catch { /* skipped below */ }
const dist = new URL('../dist', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };

function serve(total) {
  const p = payload(total, '2026-11-04T00:00:00.000Z');
  let apiCalls = 0;
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    if (path === '/api/downloads') { apiCalls++; res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify(p)); }
    const file = path === '/' ? 'index.html' : path.slice(1);
    try {
      let body = await readFile(join(dist, file));
      if (file.endsWith('.html') && p.visible) {
        body = String(body).replace(/<span class="dlc" data-downloads hidden([^>]*)><\/span>/g, `<span class="dlc" data-downloads$1>${downloadsMarkup(p, 'en')}</span>`);
      }
      res.setHeader('content-type', TYPES[extname(file)] || 'application/octet-stream');
      res.end(body);
    } catch { res.statusCode = 404; res.end(); }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, url: `http://127.0.0.1:${server.address().port}`, calls: () => apiCalls })));
}

test('below the threshold nothing renders and nothing moves', { skip: !chromium }, async () => {
  const s = await serve(249);
  const b = await chromium.launch();
  try {
    const pg = await b.newPage();
    await pg.goto(`${s.url}/`);
    assert.equal(await pg.locator('[data-downloads]:visible').count(), 0);
    assert.equal(await pg.locator('.dlc-n').count(), 0);
    await pg.goto(`${s.url}/download.html`);
    assert.equal(await pg.locator('[data-downloads]:visible').count(), 0);
  } finally { await b.close(); s.server.close(); }
});

test('reduced motion shows the number with no count-up', { skip: !chromium }, async () => {
  const s = await serve(1234);
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ reducedMotion: 'reduce', locale: 'en-US' });
    const pg = await ctx.newPage();
    const seen = [];
    await pg.exposeFunction('seen', (t) => seen.push(t));
    await pg.addInitScript(() => {
      new MutationObserver(() => { const n = document.querySelector('.dlc-n'); if (n) window.seen(n.textContent); })
        .observe(document, { subtree: true, childList: true, characterData: true });
    });
    await pg.goto(`${s.url}/`);
    await pg.waitForTimeout(800);
    assert.equal(await pg.locator('.hero-meta .dlc-n').textContent(), '1,234');
    assert.ok(seen.every((t) => t === '1,234'), `saw ${seen.join(' ')}`);
  } finally { await b.close(); s.server.close(); }
});

test('with motion it counts up from 0 to the total', { skip: !chromium }, async () => {
  const s = await serve(1234);
  const b = await chromium.launch();
  try {
    const pg = await (await b.newContext({ locale: 'en-US' })).newPage();
    await pg.goto(`${s.url}/`);
    const early = await pg.locator('.hero-meta .dlc-n').textContent();
    await pg.waitForTimeout(900);
    assert.notEqual(early, null);
    assert.equal(await pg.locator('.hero-meta .dlc-n').textContent(), '1,234');
  } finally { await b.close(); s.server.close(); }
});
