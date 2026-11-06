export const REPO = 'https://github.com/rjk6831/crewkite';
export const BLOB = `${REPO}/blob/main`;
export const DL = `${REPO}/releases/latest/download`;
export const VERSION_FALLBACK = '0.1.0';
export const ASSETS = {
  mac: 'CrewKite-macOS-arm64.dmg',
  debX64: 'crewkite_amd64.deb',
  debArm: 'crewkite_arm64.deb',
  rpmX64: 'crewkite.x86_64.rpm',
  rpmArm: 'crewkite.aarch64.rpm',
};
export const url = (name) => `${DL}/${name}`;
// The 0.1.0 hero line, word for word from the provider copy. Providers appear in GOAL order (Google,
// OpenAI, Anthropic, Local) everywhere; the order is display only.
export const ONE_LINER =
  'CrewKite runs the coding agents you already pay for, Google, OpenAI, Anthropic and a local model, as one crew on your own computer.';

// The crew shown everywhere on the site: the hero chips, the replay, the terminal demo and the Crews
// section. It matches the Demo crew in the release stills, with flight mode Balanced and subagents on
// for every role. Model names are written exactly as the stills show them.
export const CREW = [
  { role: 'Orchestrator', fam: 'a', family: 'Anthropic', model: 'Opus 5.5', effort: 'Medium' },
  { role: 'Builder', fam: 'o', family: 'OpenAI', model: 'gpt-6.1-sol', effort: 'High' },
  { role: 'Fixer', fam: 'g', family: 'Google', model: 'gemini-4-argon', effort: 'Medium' },
  { role: 'Reviewer', fam: 'o', family: 'OpenAI', model: 'gpt-6-astra', effort: 'Extra High' },
  { role: 'Challenger', fam: 'a', family: 'Anthropic', model: 'Opus 5.5', effort: 'Medium' },
  { role: 'Ask', fam: 'l', family: 'Local', model: 'gpt-oss-20b' },
];
