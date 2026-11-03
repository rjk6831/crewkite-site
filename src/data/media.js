// Every app picture on the site, one entry per slot. scripts/check-media.mjs reads this file during
// the build and fails it when a slot that is not a placeholder is missing its dark or light file at
// 1x or 2x, when a file is over 200 KB, or when a caption is missing.
//
// Release captures come from the signed 0.1.0 build at 2880 by 1800 (see the media capture spec),
// cropped at component boundaries with a 16 to 24 px margin, and exported as WebP at x1 and x2:
//   public/img/shots/<id>-<dark|light>@1x.webp and @2x.webp
// Until those land, `placeholder: true` slots show the test-build crop in both themes.

export const MEDIA = {
  'crew-builder': {
    placeholder: true,
    file: '/img/shots/crew-builder.webp',
    width: 635,
    height: 550,
    alt: "A plan card with one slice assigned to the crew's builder on OpenAI gpt-6.1-sol, followed by the builder's commands, each waiting for approval.",
    caption: "The plan gives the slice to the crew's builder on OpenAI gpt-6.1-sol. Its commands wait for approval.",
  },
  'crew-reviewer': {
    placeholder: true,
    file: '/img/shots/crew-reviewer.webp',
    width: 635,
    height: 442,
    alt: 'A local model as the reviewer reads the changed files and reports no findings, with a context line of 6,522 of 8,192.',
    caption: 'The reviewer reads the change and reports no findings, using 6,522 of its 8,192 context tokens.',
  },
  'gauges-anthropic': {
    placeholder: true,
    file: '/img/shots/gauges-anthropic.webp',
    width: 422,
    height: 440,
    alt: 'Anthropic settings with the models Opus 5.5, Fable 5.1, Sonnet 5.5 and Haiku 5.5, and gauges for weekly, Fable weekly and five-hour allowance.',
    caption: "Anthropic's weekly, Fable weekly and five-hour gauges, with every model the client lists.",
  },
  'gauges-google': {
    placeholder: true,
    file: '/img/shots/gauges-google.webp',
    width: 422,
    height: 432,
    alt: 'Google allowance gauges for weekly, Gemini 4 Argon weekly and five-hour, with Non-Gemini models listed under More allowances.',
    caption: "Google's weekly, Gemini 4 Argon weekly and five-hour gauges, with Non-Gemini models under More allowances.",
  },
  'kite-meter': {
    placeholder: true,
    file: '/img/shots/kite-meter.webp',
    width: 468,
    height: 382,
    alt: 'The kite meter panel for gpt-6.1-sol showing how many tokens the next message takes and how much thread history is stored.',
    caption: "The kite meter's next-message panel for gpt-6.1-sol.",
  },
};

// The released file names for a slot, in the order the frame renders them.
export const sources = (id) => ({
  dark: [`/img/shots/${id}-dark@1x.webp`, `/img/shots/${id}-dark@2x.webp`],
  light: [`/img/shots/${id}-light@1x.webp`, `/img/shots/${id}-light@2x.webp`],
});
