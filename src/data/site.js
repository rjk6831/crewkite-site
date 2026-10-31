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
  'CrewKite is an open-source desktop workspace where Codex, Claude Code, Antigravity and your local models work one thread together, on the subscriptions you already have.';
