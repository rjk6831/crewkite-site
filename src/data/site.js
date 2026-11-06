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
// ONE_LINER is the meta description, og:description and JSON-LD description; HERO_SUB sits under
// the H1. Providers appear in GOAL order (Google, OpenAI, Anthropic, Local); the order is display only.
export const ONE_LINER =
  'CrewKite runs Antigravity, Codex, Claude Code and a local model in LM Studio as one crew on your own computer, on the plans you already pay for. Free and open source.';
export const HERO_SUB =
  'CrewKite runs the coding agents you already pay for as one crew on your own computer, and keeps the work going when one of them reaches its limit.';

// The crew shown everywhere on the site, in the order the app's Edit crew dialog lists it, with
// effort written as the app writes it. Model names are exactly as the release stills show them.
// Side questions sit outside the crew, as in the app, so Ask is its own line.
export const CREW = [
  { role: 'Builder', fam: 'o', family: 'OpenAI', model: 'gpt-6.1-sol', effort: 'High' },
  { role: 'Reviewer', fam: 'o', family: 'OpenAI', model: 'gpt-6-astra', effort: 'Extra high' },
  { role: 'Challenger', fam: 'a', family: 'Anthropic', model: 'Opus 5.5', effort: 'Medium' },
  { role: 'Fixer', fam: 'g', family: 'Google', model: 'gemini-4-argon', effort: 'Medium' },
  { role: 'Orchestrator', fam: 'a', family: 'Anthropic', model: 'Opus 5.5', effort: 'Medium' },
];
export const ASK = { fam: 'l', family: 'Local', model: 'gpt-oss-20b' };
