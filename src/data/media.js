// Every app picture on the site, one entry per slot. scripts/check-media.mjs reads this file during
// the build and fails it when a slot is missing its dark or light file at 1x or 2x, when a file is
// over 200 KB, or when a caption or alt text is missing.
//
// Sources: the release stills listed in the a89cf34 site handoff, each SHA-256 checked, cropped at
// component boundaries by internal/v5/crop.py and exported as WebP at x1 and x2:
//   public/img/shots/<id>-<dark|light>@1x.webp and @2x.webp
// Gauge readings in these stills are samples, never plan facts.

export const MEDIA = {
  'welcome': {
    width: 800,
    height: 620,
    alt: 'The welcome screen lists Google, OpenAI, Anthropic and Local, each marked Ready.',
    caption: 'Welcome lists all four providers in one place, each Ready after its one Connect.',
  },
  'crew-editor': {
    width: 800,
    height: 770,
    alt: 'The Edit crew dialog for Demo crew: Builder gpt-6.1-sol High, Reviewer gpt-6-astra Extra high, Challenger Opus 5.5 Medium, Fixer gemini-4-argon Medium and Orchestrator Opus 5.5 Medium, each with Allow subagents on, and Flight mode Balanced.',
    caption: 'The Demo crew gives every role its own model and effort, with subagents on for each.',
  },
  'builder-effort': {
    width: 1078,
    height: 496,
    alt: "Crew settings with the Solo, Tandem and Full crew presets, and the Full crew builder's effort menu open on High.",
    caption: 'The built-in presets are Solo, Tandem and Full crew, and each role takes its own effort.',
  },
  'plan': {
    width: 758,
    height: 580,
    alt: 'A plan of four slices: three assigned to OpenAI gpt-6.1-sol as the builder and the hard CSV slice to Google gemini-4-argon as the fixer, with Run plan below.',
    caption: "The orchestrator's plan sends the hard slice to the Google fixer and the rest to the OpenAI builder.",
  },
  'changes': {
    width: 1440,
    height: 868,
    alt: 'A finished crew thread reporting 4 slices, 5 reviews and 1 fix, with the Changes panel listing eight edited files, their line counts and Accept to branch.',
    caption: 'Changes lists every edited file, and Accept to branch puts them on a new local branch.',
  },
  'accepted': {
    width: 800,
    height: 160,
    alt: 'The thread after Accept, reading Accepted 8 files to branch crewkite/harden-demo-shop-s-checkout-helpers-while-preserving-their-e.',
    caption: 'After Accept, the thread records the branch the eight files went to.',
  },
  'anthropic-rail': {
    width: 1440,
    height: 868,
    alt: 'Anthropic settings with its allowance gauges, and the rail listing Google, OpenAI, Anthropic and Local usage with reset times.',
    caption: "Anthropic's card shows the windows its plan reports, and the rail keeps every provider in view.",
  },
  'openai-allowance': {
    width: 546,
    height: 500,
    alt: 'The OpenAI allowance card with its weekly gauge, Credits paused, and the Allow credit spending switch off.',
    caption: 'OpenAI reports a weekly window, and Allow credit spending stays off until you turn it on.',
  },
  'google-allowance': {
    width: 546,
    height: 554,
    alt: 'The Google allowance card with weekly, Gemini 4 Argon weekly and five-hour gauges, and more allowances for non-Gemini models.',
    caption: 'Google reports a five-hour and a weekly window, plus a weekly window per model.',
  },
  'kite-meter': {
    width: 869,
    height: 446,
    alt: "A side question answered on GPT-OSS 20B beside the thread, and the kite meter's next message panel for gemini-4-argon.",
    caption: 'The kite meter shows what the next message will use before you send it.',
  },
  'control': {
    width: 378,
    height: 360,
    alt: 'The Crew panel with the information marks for Flight mode and Permissions open.',
    caption: 'Flight mode sets how much the crew does on its own, and Permissions which commands run without asking.',
  },
};

// The released file names for a slot, in the order the frame renders them.
export const sources = (id) => ({
  dark: [`/img/shots/${id}-dark@1x.webp`, `/img/shots/${id}-dark@2x.webp`],
  light: [`/img/shots/${id}-light@1x.webp`, `/img/shots/${id}-light@2x.webp`],
});

// Release clips, full window without the title bar, 1440 by 868. A clip that exists in one theme only
// sets `only` and shows only in that theme, labelled.
export const CLIPS = {
  'permission-gate': {
    width: 1440,
    height: 868,
    dark: '/media/permission-gate-dark.mp4',
    light: '/media/permission-gate-light.mp4',
    label: 'The builder on gpt-6.1-sol stops at a command and waits for Allow once, Allow for this thread or Deny.',
    caption: 'A command outside the allowed set waits for your answer.',
  },
  'credit-continuation': {
    width: 1440,
    height: 868,
    only: 'dark',
    dark: '/media/credit-continuation-dark.mp4',
    label: 'With OpenAI credits paused, slices 2 and 3 continue on Google gemini-4-argon, and the thread notes each move with its reason.',
    caption: 'With credits off, slices continue on Google when OpenAI reaches its limit. Dark theme only.',
  },
};
