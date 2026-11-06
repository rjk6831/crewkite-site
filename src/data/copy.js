// Copy that must match CrewKite 0.1.0 at a89cf34. Each block says where its words come from.
// Provider wording is from internal/site-provider-copy.md, "Today (0.1.0)", word for word. Its ground
// rules hold here too: company names only (Google, OpenAI, Anthropic, xAI), no client product names,
// and GOAL is display order, never routing priority.
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
    key: 'g', name: 'Google', client: "Google's own coding client, on your Google account",
    plan: 'As of 31 October 2026, Google gives accounts without a paid plan a quota that refreshes weekly. Google AI Pro refreshes every five hours until a weekly limit, and Google AI Ultra has the highest quota. Limits follow available capacity.',
    linux: 'Not on Linux',
    note: true,
  },
  {
    key: 'o', name: 'OpenAI', client: "OpenAI's own coding client, on your OpenAI plan",
    plan: 'As of 31 October 2026, OpenAI says its coding client is included in its Free, Go, Plus, Pro, Business, Edu and Enterprise plans. Usage limits depend on the plan, the model and the task.',
    aside: 'CrewKite runs this client in its own home with its own sign-in, so nothing it does shows in your own OpenAI app.',
  },
  {
    key: 'a', name: 'Anthropic', client: "Anthropic's own coding client, on your Anthropic plan",
    plan: 'As of 31 October 2026, Anthropic includes its coding client in its Pro, Max, Team and Enterprise plans and leaves it out of Free. Pro and Max have a five-hour and a weekly limit. Ultra (formerly Max 20x) has a weekly limit only for verified accounts, as of November 2026; a newly opened Ultra account keeps a five-hour limit until Anthropic verifies it.',
  },
  {
    key: 'l', name: 'Local', client: 'LM Studio, on this computer',
    plan: 'As of 31 October 2026, LM Studio is free to use at home and at work. Speed and context follow your hardware.',
    aside: 'The site and the app use gpt-oss-20b. Local reconnects by itself when LM Studio restarts.',
  },
];

export const PROVIDERS_LEDE = 'Four rows, in the kite\'s order: Google, OpenAI, Anthropic, Local. Each runs through its provider\'s own client, signed in with your own plan. CrewKite reads each plan\'s allowance and shows it in the sidebar. A thread can move between providers and keep its messages and edited files.';

export const GOOGLE_TERMS = 'Google\'s published FAQ says third-party access through its coding client login breaks its terms. CrewKite has no exception. Google stays off until you read a short summary in Settings and accept the risk. Use it only if that trade is yours to make.';
export const GOOGLE_TERMS_LINK = `${BLOB}/docs/providers.md#google-and-your-account`;

export const LINUX_LINE = 'On Linux, OpenAI, Anthropic and Local run as a preview. Google is not offered on Linux; its row stays visible and reads "Not on Linux".';

export const WHATS_NEXT = ['Named builders in a crew', 'An API key route per provider', 'Grok (xAI) as the other choice for the G row', 'Windows'];
export const XAI_NEXT = 'Grok (xAI) is next for the G row. Its coding client speaks the same protocol CrewKite already uses for Google and signs in with an xAI subscription, which would give Linux a fourth subscription family and give everyone a G choice inside its provider\'s terms. It ships after a terms review and a qualification run on macOS and Linux.';

// From internal/site-run-tests-copy.md, word for word. Run tests reports failures and never fixes
// them, and it runs as a local process with your permissions, so the site never calls it a sandbox.
export const RUN_TESTS = 'Run tests runs your project\'s test command in the thread\'s copy and shows the exit status and output, with no model involved and no credits spent.';
export const RUN_TESTS_LONG = 'Every thread works in its own copy of your repository. Run tests runs the test command CrewKite found in your project, such as the <code>test</code> script in package.json, pytest or <code>cargo test</code>, in that copy whenever you like. It asks before the first run unless you have allowed the command for the thread, shows exactly which command runs, and keeps the exit status and the output beside the thread. It never starts a model, so it costs nothing against any plan. Crews still run the checks you switch on after each fix and after the last slice of a plan.';
