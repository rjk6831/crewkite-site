# Design system

The site uses one set of tokens in `src/styles/tokens.css`, imported once by `src/layouts/Base.astro`. Every component and page reads from it. `npm run check` runs `scripts/check-tokens.mjs`, which fails on a raw color, a raw px font size or a raw px spacing value anywhere else, so the tokens stay the only source.

Color tokens carry the same names and values as `apps/desktop/src/renderer/style.css` in the app repository. The screenshots on the site come from the app, so a shared palette keeps the page and the pictures in one visual system. When the app changes a color, I copy the change here in the same commit that updates the screenshots.

## Rules

- Use a token for every color, font size, space, radius, shadow, layer and duration. Add a token before adding a value.
- Keep raw px for sizes that are not spacing: widths, heights, icon boxes and border widths. The checker allows 1 px hairlines everywhere.
- Write media queries at the breakpoints only: 480, 768, 1024 and 1280 px, or one less for a max-width query.
- Mark a deliberate exception with `/* token-ok: <reason> */` on the same line. I have none today.
- Delays inside a choreographed animation, such as the replay or the kite, stay local to that component. Durations come from the motion tokens.

## Color

| Token | Dark (default) | Light | Use |
|-------|----------------|-------|-----|
| `--background` | #151718 | #f7f8f5 | Page |
| `--sidebar` | #111314 | #eff1ed | Recessed panels, code blocks |
| `--surface` | #1b1e20 | #fff | Cards |
| `--surface-raised` | #222629 | #f3f5f0 | Raised rows, table heads |
| `--surface-hover` | #292e31 | #e8ece4 | Hover |
| `--border` | #2b3033 | #dce1d8 | Hairlines |
| `--border-strong` | #3a4145 | #c7cfc1 | Control outlines |
| `--text` | #e5e8e7 | #222b25 | Body and headings |
| `--text-muted` | #a1aaa8 | #5c6b60 | Secondary text |
| `--text-dim` | #8f9996 | #5c6b60 | Labels, captions |
| `--accent` | #d0e7a1 | #426326 | Primary action, focus ring |
| `--accent-ink` | #202a17 | #fff | Text on accent |
| `--blue`, `--amber`, `--red`, `--green` | | | States |
| `--family-openai`, `-anthropic`, `-google`, `-local` | | | Family text, 4.5:1 on every surface |
| `--family-*-fill` | | | Family fills, the kite panels |

Site-only colors are `--diff-add-bg`, `--diff-del-bg`, `--glow` and `--mask-ink`. The terminal demo is a dark terminal in both themes, so its colors live in a fixed `--terminal-*` set.

## Type

Inter for text and JetBrains Mono for code, both self-hosted. Each step has a paired line height in `--text-<step>-lh`.

| Token | Size | Line height | Use |
|-------|------|-------------|-----|
| `--text-2xs` | 11 px | 1.45 | Family marks, small badges |
| `--text-xs` | 12 px | 1.5 | Eyebrows, meta, code in cards |
| `--text-sm` | 13 px | 1.55 | Captions, chips, replay body |
| `--text-md` | 14 px | 1.6 | Secondary copy, tables |
| `--text-ui` | 15 px | 1.5 | Nav links, buttons |
| `--text-base` | 16 px | 1.6 | Body |
| `--text-lg` | 18 px | 1.55 | Lede, hero subhead |
| `--text-xl` | 22 px | 1.3 | Small headings |
| `--text-h3` | 20 to 28 px, fluid | 1.25 | Feature and block headings |
| `--text-h2` | 30 to 44 px, fluid | 1.1 | Section headings |
| `--text-display` | 34 to 66 px, fluid | 1.04 | Page titles and the hero |

Weights are `--weight-light` 300, `--weight-regular` 400, `--weight-medium` 500, `--weight-semibold` 600 and `--weight-bold` 650. Tracking is `--tracking-display`, `--tracking-tight`, `--tracking-snug` and `--tracking-caps` for uppercase labels.

## Spacing and rhythm

Spacing sits on a 4 px base: `--space-1` 4, `--space-2` 8, `--space-3` 12, `--space-4` 16, `--space-6` 24, `--space-8` 32, `--space-12` 48, `--space-16` 64, `--space-24` 96 and `--space-32` 128 px. Two extra steps have one job each: `--space-0-5` (2 px) for gaps inside small controls, and `--space-10` (40 px) from a section's lede to its content.

Layout tokens build on the scale: `--content-max` (1200 px), `--space-gutter` (24 px, 16 on phones) and `--measure` (52ch, about 68 characters of Inter, for body copy; body copy runs 60 to 72 characters a line).

Rhythm, as the tokens set it:

| Gap | Desktop | Phone | Token |
|-----|---------|-------|-------|
| Section to section | 96 px | 64 px | `--space-section`, half above and half below |
| Sub-block to sub-block | 64 px | 48 px | `--space-block`, half above and half below |
| Eyebrow to H2 | 12 px | 12 px | `--rhythm-eyebrow` |
| H2 to lede | 16 px | 16 px | `--rhythm-lede` |
| Lede to content | 40 px | 40 px | `--rhythm-content` |
| Figure to caption | 12 px | 12 px | `--rhythm-caption` |

The header is 72 px tall on desktop and 60 px on phones (`--header-height`), with the wordmark at 32 and 26 px (`--wordmark-height`).

## Shape, depth, layers and motion

- Radius: `--radius-sm` 6, `--radius-md` 10, `--radius-lg` 16 and `--radius-full`.
- Borders: `--border-hairline` 1 px, `--border-thick` 2 px. Focus: `--focus-ring` with `--focus-offset`.
- Elevation: `--elevation-1` for screenshots and resting cards, `--elevation-2` for floating labels, `--elevation-3` for the app window and the terminal. Light theme has its own softer values.
- Layers: `--z-raised`, `--z-header`, `--z-skip`.
- Motion: `--duration-instant` 120, `--duration-fast` 160, `--duration-base` 200, `--duration-moderate` 300, `--duration-slow` 500 and `--duration-slower` 900 ms, with `--ease-out`, `--ease-out-quint` and `--ease-in-out`. Every animation has a still state under `prefers-reduced-motion`.

## Components

| Component | Where | Notes |
|-----------|-------|-------|
| Button | `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm` in global.css | 48 px tall, 36 px small. Primary uses the accent. |
| Nav link | `.nav-link` in Base.astro | 15 px text on a 40 px hit target; the theme toggle is the same size and reports its state with aria-pressed. |
| Chip | `.rchip` (role chips), `.chips li` (feature chips), `.fam` (family mark) | Labels, never controls. |
| Card | `.fcard`, `.scard`, `.mf`, `.feat-vis` | Surface, hairline border, `--radius-lg`. |
| Screenshot frame | `Shot.astro`, fed by `src/data/media.js` | One frame for every app picture, a dark and a light file at 1x and 2x switched by the theme, and a one-sentence caption. `scripts/check-media.mjs` fails the build on a missing theme, density or caption. |
| Code block | `.cmd` in global.css | Mono text with a copy button that confirms in place. |
| Table | `.mtx` in download.astro | Scrolls sideways inside its own box on phones. |
| Callout | `.fcard-note`, `.limits` | Notes that need a second look, such as Google's terms. |
