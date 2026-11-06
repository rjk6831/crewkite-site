// Copy that must match CrewKite 0.1.0 at a89cf34. Each block says where its words come from.
// Provider wording is from internal/site-provider-copy.md, "Today (0.1.0)", with the go-live
// corrections of 7 November on top: the card sublines name each provider's own client as a plain
// factual reference, the intro opens on the clients, and the Linux line drops the spec wording. GOAL
// is display order, never routing priority.
import { BLOB } from './site.js';

// The twelve feature cards, in order, from the go-live prompt v5, section 9a. Titles of two to four
// words, one plain sentence each.
export const FEATURES = [
  { icon: 'crew', title: 'One crew, four providers', text: 'Plan with Opus, build with Sol, fix with Argon and review with Astra in one thread, each on your own subscription.', href: '#crew' },
  { icon: 'relay', title: 'Keeps going at the limit', text: 'When a provider runs out of included allowance, the work moves to the next connected one with its messages and edited files.', href: '#allowances' },
  { icon: 'gauge', title: 'Every allowance in view', text: 'The rail shows each provider\'s usage windows and when they reset, read on a timer from your own plans.', href: '#allowances' },
  { icon: 'meter', title: 'Next message meter', text: 'The kite meter shows what the next message will cost against each window before you send it.', href: '#meter' },
  { icon: 'coin-off', title: 'Credits you control', text: 'Allow credit spending starts off for OpenAI and Anthropic, so once a plan runs out, the next turn moves to another provider before it spends a credit.', href: '#credits' },
  { icon: 'ask', title: 'Side questions', text: 'Ask a quick question on a local model while the builder keeps working.', href: '#meter' },
  { icon: 'branch', title: 'Safe by default', text: 'Every thread works in its own copy of your repository. Your checkout stays as it is until you accept a change.', href: '#review' },
  { icon: 'sliders', title: 'You set the pace', text: 'Flight mode decides how much the crew does on its own, and Permissions decides which commands it may run without asking.', href: '#control' },
  { icon: 'flask', title: 'Run tests on demand', text: 'Run tests runs your project\'s test command in the thread\'s copy and shows the exit status and output, with no model involved and no credits spent.', href: '#run-tests' },
  { icon: 'key', title: 'Your keys stay yours', text: 'CrewKite runs each provider\'s own client on your own plan. It adds no markup and holds no API key, and its OpenAI client has its own home, so nothing shows up in your own OpenAI app.', href: '#providers' },
  { icon: 'chip', title: 'Any local model', text: 'Load Qwen, gpt-oss, Gemma or any chat model your hardware can run in LM Studio, and it joins the crew with no usage limits. CrewKite runs the agent loop for it and sizes every prompt to the model\'s context.', href: '#providers' },
  { icon: 'terminal', title: 'Terminal too', text: 'The same crews and threads from a CLI.', href: '#terminal' },
];

// Providers in GOAL order (Google, OpenAI, Anthropic, Local). GOAL is display order only; it never
// decides which provider runs. Plan lines follow the main README at a89cf34 and the v5 plan rules.
export const FAMILIES = [
  {
    key: 'g', name: 'Google', client: "Antigravity, Google's coding client, on your Google account",
    plan: 'As of 31 October 2026, Google gives accounts without a paid plan a quota that refreshes weekly. Google AI Pro refreshes every five hours until a weekly limit, and Google AI Ultra has the highest quota. Limits follow available capacity.',
    linux: 'Not on Linux',
    note: true,
  },
  {
    key: 'o', name: 'OpenAI', client: "Codex, OpenAI's coding client, on your OpenAI plan",
    plan: 'As of 31 October 2026, OpenAI says its coding client is included in its Free, Go, Plus, Pro, Business, Edu and Enterprise plans. Usage limits depend on the plan, the model and the task.',
    aside: 'CrewKite runs this client in its own home with its own sign-in, so nothing it does shows in your own OpenAI app.',
  },
  {
    key: 'a', name: 'Anthropic', client: "Claude Code, Anthropic's coding client, on your Anthropic plan",
    plan: 'As of 31 October 2026, Anthropic includes its coding client in its Pro, Max, Team and Enterprise plans and leaves it out of Free. Pro and Max have a five-hour and a weekly limit. Ultra (formerly Max 20x) has a weekly limit only for verified accounts, as of November 2026; a newly opened Ultra account keeps a five-hour limit until Anthropic verifies it.',
  },
  {
    key: 'l', name: 'Local', client: 'LM Studio, on this computer',
    plan: 'As of 31 October 2026, LM Studio is free to use at home and at work. Speed and context follow your hardware.',
    aside: 'Load any chat model LM Studio can run on your machine, such as Qwen, gpt-oss or Gemma, and pick it in CrewKite. CrewKite runs the agent loop itself. It gives the model tools to read, search, edit and run commands in the thread\'s copy, and fits every prompt to the context the model reports. Models without native tool calling work too. Connect works with LM Studio\'s authentication on or off, and Local reconnects by itself when LM Studio restarts.',
  },
];

export const PROVIDERS_LEDE = 'Each provider runs through its own client, signed in with your own plan. CrewKite reads each plan\'s allowance and shows it in the sidebar. A thread can move between providers and keep its messages and edited files.';

export const GOOGLE_TERMS = 'Google\'s published FAQ says third-party access through its coding client login breaks its terms. CrewKite has no exception. Google stays off until you read a short summary in Settings and accept the risk. Use it only if that trade is yours to make.';
export const GOOGLE_TERMS_LINK = `${BLOB}/docs/providers.md#google-and-your-account`;

export const LINUX_LINE = 'On Linux, OpenAI, Anthropic and Local run as a preview. Google is not available on Linux yet.';
export const GOAL_NOD = 'G, O, A, L. Yes, we noticed.';

// The roadmap, from the README Roadmap and docs/roadmap.md "After 0.1.0" (docs/roadmap-versions), in
// the wording the go-live corrections give.
export const ROADMAP_NEXT = [
  {
    icon: 'palette',
    title: 'Design systems, enforced on every provider',
    text: 'Configure a design system once and CrewKite enforces it on every provider.',
    facts: [
      'One reusable file names a project\'s tokens, components and rules, and CrewKite can draft it from your existing tokens.',
      'Every crew role gets the same design brief, so a builder on OpenAI, a fixer on Google and a reviewer on Anthropic work to one standard.',
      'A token check and a screenshot check run on every candidate, and a failed check blocks Accept and goes back to the fixer with the exact lines.',
    ],
  },
  {
    icon: 'pr',
    title: 'GitHub in the thread',
    text: 'Follow a pull request\'s CI from the thread, through your own GitHub sign-in.',
    facts: [
      'Every check, its status and its log, with the failing step pulled out.',
      'One click sends a failure to the fixer with that log, and the fix comes back for you to accept and push.',
      'Re-run failed jobs, read review comments, and squash merge with your own title, description and sign-off behind an explicit click.',
    ],
  },
];
export const ROADMAP_LATER = [
  'Named builders: a crew roster with a provider, model and effort per builder',
  'An API key route per provider',
  'Grok (xAI) for the G row, after a terms review and qualification on macOS and Linux',
  'The Windows port',
  'Google, task writers, formatting and verification on Linux',
  'Large repository work off the main thread',
  'Project notes on demand, and context-aware routing',
  'Published bench results',
];
export const ROADMAP_LINK = `${BLOB}/docs/roadmap.md`;

export const RUN_TESTS_FACTS = ['Asks before the first run', 'Shows the exact command', 'Keeps the exit status and output, with no model and no credits'];

// From internal/site-run-tests-copy.md, word for word. Run tests reports failures and never fixes
// them, and it runs as a local process with your permissions, so the site never calls it a sandbox.
export const RUN_TESTS = 'Run tests runs your project\'s test command in the thread\'s copy and shows the exit status and output, with no model involved and no credits spent.';
export const RUN_TESTS_LONG = 'Every thread works in its own copy of your repository. Run tests runs the test command CrewKite found in your project, such as the <code>test</code> script in package.json, pytest or <code>cargo test</code>, in that copy whenever you like. It asks before the first run unless you have allowed the command for the thread, shows exactly which command runs, and keeps the exit status and the output beside the thread. It never starts a model, so it costs nothing against any plan. Crews still run the checks you switch on after each fix and after the last slice of a plan.';

// Credits, from the polish pass of 7 November, checked against docs/providers.md "Credit spending".
export const CREDITS = 'Allow credit spending is a switch for OpenAI and for Anthropic, and it starts off. With it off, once a plan\'s included usage runs out, CrewKite starts no new turn on that provider: a crew step runs on the next provider, and a thread moves to the next one with allowance left. The rail shows "Credits paused" so you can see why. OpenAI spends purchased credits on its own once a plan\'s included usage runs out, and as of November 2026 I found no setting in its own apps or CLI that turns that off. A turn that is already running finishes, and the switch can never turn credits on. The provider\'s own setting still decides that.';
