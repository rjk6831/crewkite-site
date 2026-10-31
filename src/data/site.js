export const REPO = 'https://github.com/rjk6831/crewkite';
export const BLOB = `${REPO}/blob/main`;
export const DL = `${REPO}/releases/latest/download`;
export const VERSION_FALLBACK = '0.1.0';
export const ASSETS = {
  mac: 'CrewKite-macOS-arm64.dmg',
  appimageX64: 'CrewKite-linux-x86_64.AppImage',
  appimageArm: 'CrewKite-linux-arm64.AppImage',
  debX64: 'crewkite_amd64.deb',
  debArm: 'crewkite_arm64.deb',
  rpmX64: 'crewkite.x86_64.rpm',
  rpmArm: 'crewkite.aarch64.rpm',
};
export const url = (name) => `${DL}/${name}`;
export const ONE_LINER =
  'CrewKite is a local workspace for the coding agents you already pay for. It runs the OpenAI, Anthropic and Google clients you have signed in, and a local model, as threads on your own computer. A thread can move from one provider to another and keep its messages and its edited files.';
