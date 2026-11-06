// Fails the build when an app picture is incomplete. Every slot in src/data/media.js needs its dark
// and light files at 1x and 2x, each under 200 KB, plus a caption, alt text and size. Every clip needs
// its file and poster for each theme it claims, and a clip without both themes must say which one it
// has. It also fails on any shot file in public/img/shots that exists in one theme only.
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { MEDIA, CLIPS, sources } from '../src/data/media.js';

const pub = new URL('../public', import.meta.url).pathname;
const LIMIT = 200 * 1024;
const problems = [];
const size = async (p) => { try { return (await stat(join(pub, p))).size; } catch { return -1; } };

for (const [id, m] of Object.entries(MEDIA)) {
  if (!m.caption) problems.push(`${id}: no caption`);
  if (!m.alt) problems.push(`${id}: no alt text`);
  if (!m.width || !m.height) problems.push(`${id}: no width and height`);
  for (const f of [...sources(id).dark, ...sources(id).light]) {
    const n = await size(f);
    if (n < 0) problems.push(`${id}: missing ${f}`);
    else if (n > LIMIT) problems.push(`${id}: ${f} is ${Math.round(n / 1024)} KB, over 200 KB`);
  }
}

for (const [id, c] of Object.entries(CLIPS)) {
  if (!c.caption || !c.label) problems.push(`clip ${id}: needs a caption and a label`);
  const themes = c.only ? [c.only] : ['dark', 'light'];
  if (!c.only && (!c.dark || !c.light)) problems.push(`clip ${id}: has one theme but does not set only`);
  if (c.only && !/theme only/i.test(c.caption)) problems.push(`clip ${id}: a one-theme clip must say so in its caption`);
  for (const t of themes) {
    if (!c[t] || (await size(c[t])) < 0) problems.push(`clip ${id}: missing ${t} file`);
    else if ((await size(c[t].replace(/\.mp4$/, '-poster.webp'))) < 0) problems.push(`clip ${id}: missing ${t} poster`);
  }
}

const names = await readdir(join(pub, 'img', 'shots')).catch(() => []);
for (const n of names) {
  if (n.includes('@')) { problems.push(`img/shots/${n}: no "@" in asset paths`); continue; }
  const m = n.match(/^(.+)-(dark|light)-([12])x\.webp$/);
  if (!m) { problems.push(`img/shots/${n} is not a themed shot`); continue; }
  const other = `${m[1]}-${m[2] === 'dark' ? 'light' : 'dark'}-${m[3]}x.webp`;
  if (!names.includes(other)) problems.push(`${n} has no ${other}`);
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`media: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`media: clean (${Object.keys(MEDIA).length} shots, ${Object.keys(CLIPS).length} clips)`);
