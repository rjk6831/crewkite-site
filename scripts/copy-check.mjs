// Mechanical copy rules for every page: no em or en dashes, no contrast framing, no hype words.
// Passing this is the floor. The copy still has to read like a person wrote it.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const banned = [
  /[–—]/,
  /\bnot just\b/i,
  /\brather than\b/i,
  /\binstead of\b/i,
  /\bnot [^.,;]{1,40}, but\b/i,
  /\b(seamless(ly)?|effortless(ly)?|revolutionary|supercharge[ds]?|game-?changing|unleash|cutting-edge|blazing|leverage[sd]?|robust|empower|delve|holistic|pivotal|crucial|streamline[sd]?)\b/i,
  /CrewKite is (a|an) [^.]{0,40}\b(harness|wrapper|platform|framework)\b/i,
  /!(?=\s|<|$)/,
];
let bad = 0;
for (const f of await readdir(dist)) {
  if (!f.endsWith('.html')) continue;
  const html = await readFile(join(dist, f), 'utf8');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');
  for (const re of banned) {
    const m = text.match(re);
    if (m) {
      bad++;
      const i = Math.max(0, m.index - 50);
      console.log(`${f}: ${re} -> ...${text.slice(i, m.index + 60)}...`);
    }
  }
}
if (bad) process.exit(1);
console.log('copy: clean');
