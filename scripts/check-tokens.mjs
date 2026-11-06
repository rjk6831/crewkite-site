// Every style on the site has to come from src/styles/tokens.css. This check reads the CSS in
// src/ (.css files, <style> blocks and style attributes in .astro files) and fails on:
//   - a raw color: #hex, rgb(), rgba(), hsl() or hsla()
//   - a raw px font size, in font-size or the font shorthand
//   - a raw px value in a spacing property (margin, padding, gap, inset and the offsets)
//   - a px value in @media that is not one of the breakpoints
// Allowed without comment: 0, 1px hairlines, values inside var() fallbacks of a token, and px in
// sizes that are not spacing (width, height, borders, shadows, transforms).
// A line can opt out with a trailing comment `/* token-ok: <reason> */`. Keep those rare and say why.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const src = join(root, 'src');
const TOKENS = join(src, 'styles', 'tokens.css');
const BREAKPOINTS = new Set([480, 768, 1024, 1280, 479, 767, 1023, 1279]);
const SPACING = /^(margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|scroll-padding|scroll-margin)(-[a-z-]+)?$/;
const COLOR = /(?<![&\w-])#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(css|astro)$/.test(e.name) && p !== TOKENS) yield p;
  }
}

// Returns [line number, css text] pairs for the CSS a file holds, keeping line numbers.
function cssRegions(file, text) {
  if (file.endsWith('.css')) return [[1, text]];
  const out = [];
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) out.push([lineAt(m.index + m[0].indexOf(m[1])), m[1]]);
  for (const m of text.matchAll(/\sstyle=(?:"([^"]*)"|\{`([^`]*)`\})/g)) out.push([lineAt(m.index), m[1] ?? m[2]]);
  return out;
}

const problems = [];
for await (const file of walk(src)) {
  const text = await readFile(file, 'utf8');
  for (const [startLine, css] of cssRegions(file, text)) {
    css.split('\n').forEach((line, i) => {
      if (/token-ok:/.test(line)) return;
      const where = `${relative(root, file)}:${startLine + i}`;
      const media = line.match(/@media[^{]*/);
      if (media) {
        for (const px of media[0].matchAll(/(\d+(?:\.\d+)?)px/g)) {
          if (!BREAKPOINTS.has(Number(px[1]))) problems.push(`${where} breakpoint ${px[0]} is not a token value`);
        }
        return;
      }
      if (COLOR.test(line)) problems.push(`${where} raw color: ${line.trim()}`);
      for (const m of line.matchAll(/(?:^|[\s{;])([a-z-]+)\s*:\s*([^;{}]+)/g)) {
        const [, prop, value] = m;
        if (prop.startsWith('--')) continue;
        const bare = value.replace(/var\([^()]*(?:\([^()]*\))?[^()]*\)/g, '');
        const pxs = [...bare.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((x) => Number(x[1]));
        if (prop === 'font-size' && pxs.length) problems.push(`${where} raw font size: ${line.trim()}`);
        if (prop === 'font' && pxs.length) problems.push(`${where} raw font size in shorthand: ${line.trim()}`);
        if (SPACING.test(prop) && pxs.some((n) => Math.abs(n) > 1)) problems.push(`${where} raw spacing: ${line.trim()}`);
      }
    });
  }
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`tokens: ${problems.length} raw value(s) outside src/styles/tokens.css`);
  process.exit(1);
}
console.log('tokens: clean');
