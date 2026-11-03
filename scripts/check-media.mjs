// Fails the build when an app picture is incomplete. For every slot in src/data/media.js that is
// not a placeholder: the dark and light files must both exist at 1x and 2x, each under 200 KB, and
// the slot needs a caption and alt text. Placeholders need their one file and a caption. It also
// fails on any shot file in public/img/shots that exists in one theme only.
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { MEDIA, sources } from '../src/data/media.js';

const pub = new URL('../public', import.meta.url).pathname;
const LIMIT = 200 * 1024;
const problems = [];
const size = async (p) => { try { return (await stat(join(pub, p))).size; } catch { return -1; } };

for (const [id, m] of Object.entries(MEDIA)) {
  if (!m.caption) problems.push(`${id}: no caption`);
  if (!m.alt) problems.push(`${id}: no alt text`);
  if (!m.width || !m.height) problems.push(`${id}: no width and height`);
  const files = m.placeholder ? [m.file] : [...sources(id).dark, ...sources(id).light];
  for (const f of files) {
    const n = await size(f);
    if (n < 0) problems.push(`${id}: missing ${f}`);
    else if (n > LIMIT) problems.push(`${id}: ${f} is ${Math.round(n / 1024)} KB, over 200 KB`);
  }
}

const names = await readdir(join(pub, 'img', 'shots')).catch(() => []);
for (const n of names) {
  const m = n.match(/^(.+)-(dark|light)@([12])x\.webp$/);
  if (!m) continue;
  const other = `${m[1]}-${m[2] === 'dark' ? 'light' : 'dark'}@${m[3]}x.webp`;
  if (!names.includes(other)) problems.push(`${n} has no ${other}`);
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`media: ${problems.length} problem(s)`);
  process.exit(1);
}
const held = Object.entries(MEDIA).filter(([, m]) => m.placeholder).map(([id]) => id);
console.log(`media: clean${held.length ? ` (${held.length} placeholder slot(s): ${held.join(', ')})` : ''}`);
