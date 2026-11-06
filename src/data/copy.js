// Copy that must match CrewKite 0.1.0 at a89cf34. Each block says where its words come from.
import { BLOB } from './site.js';

// The twelve feature cards, in order, from the go-live prompt v5, section 9a. Titles of two to four
// words, one plain sentence each.
export const FEATURES = [
  { icon: 'crew', title: 'One crew, four providers', text: 'Plan with Opus, build with Sol, fix with Argon and review with Astra in one thread, each on your own subscription.', href: '#crew' },
  { icon: 'relay', title: 'Keeps going at the limit', text: 'When a provider runs out of included allowance, the work moves to the next connected one with its messages and edited files.', href: '#allowances' },
  { icon: 'gauge', title: 'Every allowance in view', text: 'The rail shows each provider\'s usage windows and when they reset, read on a timer from your own plans.', href: '#allowances' },
  { icon: 'meter', title: 'Next message meter', text: 'The kite meter shows what the next message will cost against each window before you send it.', href: '#meter' },
  { icon: 'coin-off', title: 'Credits stay off', text: 'Allow credit spending is off by default for OpenAI and Anthropic, so a step that would spend credits moves to another provider before it starts.', href: '#credits' },
  { icon: 'ask', title: 'Side questions', text: 'Ask a quick question on a local model while the builder keeps working.', href: '#meter' },
  { icon: 'branch', title: 'Safe by default', text: 'Every thread works in its own copy of your repository. Your checkout stays as it is until you accept a change.', href: '#review' },
  { icon: 'sliders', title: 'You set the pace', text: 'Flight mode decides how much the crew does on its own, and Permissions decides which commands it may run without asking.', href: '#control' },
  { icon: 'flask', title: 'Run tests on demand', text: 'Run tests runs your project\'s test command in the thread\'s copy and shows the exit status and output, with no model involved and no credits spent.', href: '#run-tests' },
  { icon: 'key', title: 'Your keys stay yours', text: 'CrewKite runs each provider\'s own client on your own plan. It adds no markup and holds no API key, and its OpenAI client has its own home, so nothing shows up in your own OpenAI app.', href: '#providers' },
  { icon: 'chip', title: 'Local model included', text: 'gpt-oss-20b in LM Studio counts as a full crew member with no limits, and reconnects by itself when LM Studio restarts.', href: '#providers' },
  { icon: 'terminal', title: 'Terminal too', text: 'The same crews and threads from a CLI.', href: '#terminal' },
];

// Providers in GOAL order (Google, OpenAI, Anthropic, Local). GOAL is display order only; it never
// decides which provider runs. Plan lines follow the main README at a89cf34 and the v5 plan rules.
export const FAMILIES = [
  {
    key: 'g', name: 'Google', client: 'Antigravity, through the Agent Client Protocol',
    plan: 'As of 31 October 2026, Google gives accounts without a paid plan a quota that refreshes weekly. Google AI Pro refreshes every five hours until a weekly limit, and Google AI Ultra has the highest quota. Limits follow available capacity.',
    linux: 'Not on Linux',
    note: true,
  },
  {
    key: 'o', name: 'OpenAI', client: 'Codex, through its app-server client',
    plan: 'As of 31 October 2026, OpenAI says its coding client is included in its Free, Go, Plus, Pro, Business, Edu and Enterprise plans. Usage limits depend on the plan, the model and the task.',
    aside: 'CrewKite runs this client in its own home with its own sign-in, so nothing it does shows in your own OpenAI app.',
  },
  {
    key: 'a', name: 'Anthropic', client: 'Claude Code, through its stream-json mode',
    plan: 'As of 31 October 2026, Anthropic includes its coding client in its Pro, Max, Team and Enterprise plans and leaves it out of Free. Pro and Max have a five-hour and a weekly limit. Ultra (formerly Max 20x) has a weekly limit only for verified accounts, as of November 2026; a newly opened Ultra account keeps a five-hour limit until Anthropic verifies it.',
  },
  {
    key: 'l', name: 'Local', client: 'LM Studio, on this computer',
    plan: 'As of 31 October 2026, LM Studio is free to use at home and at work. Speed and context follow your hardware.',
    aside: 'The site and the app use gpt-oss-20b. Local reconnects by itself when LM Studio restarts.',
  },
];

export const GOOGLE_TERMS = `Google's third-party access FAQ says that third-party access through its coding client login violates its terms. Its headless FAQ also excludes consumer CLI wrappers. Google does not name CrewKite, and CrewKite has no exception from Google. Using the Google route is your own choice and your own risk. Settings keeps Connect Google off until you tick a box that says you have read Google's terms and accept the risk. <a href="${BLOB}/docs/providers.md#google-and-your-account">The dated links</a> are in the docs.`;

export const LINUX_LINE = 'On Linux, OpenAI, Anthropic and Local run in a preview. Google is not on Linux.';

export const WHATS_NEXT = [
  'GitHub checks in the thread: a pull request\'s CI results and logs, re-running failed jobs, and squash merging with your own message, each through your own GitHub sign-in and an explicit click.',
  'Grok (xAI) as the other choice for the G row. Grok\'s own coding client speaks the same protocol as the Google route and signs in with your xAI subscription, so it would bring a fourth subscription family to Linux and to people who skip the Google route. It ships after I review xAI\'s terms and qualify Grok on macOS and Linux.',
  'Windows, once the port is done.',
  'Google on Linux.',
];

export const RUN_TESTS = 'Run tests runs your project\'s test command in the thread\'s copy and shows the exit status and output, with no model involved and no credits spent.';
