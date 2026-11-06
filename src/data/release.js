// The 0.1.0 release, built from a89cf34b1f9505446006b652203a3cc37d1e283c. Names, sizes and SHA-256
// come from the release handoff; SHA256SUMS in the GitHub release must match them. The Worker still
// prefers what the published release reports, so a mismatch shows up on the page.
//
// `published` stays false until Raymond says "go live a89cf34" and the GitHub release exists. While it
// is false every installer button renders disabled, labelled "Available on release day".
export const RELEASE = {
  version: '0.1.0',
  commit: 'a89cf34b1f9505446006b652203a3cc37d1e283c',
  published: false,
  notarized: true,
  notesUrl: 'https://github.com/rjk6831/crewkite/releases/tag/v0.1.0',
  assets: {
    'CrewKite-macOS-arm64.dmg': { platform: 'macOS, Apple silicon', bytes: 222603257, sha256: '294f9f14022014815edccd610608abbf12eb6c58ad7d41e2af5b0bdd8d59b5f3' },
    'crewkite_amd64.deb': { platform: 'Linux x64, DEB', bytes: 151371868, sha256: '98ef7b4763dafc0cf057f800d47ffe01dbfd6316388bc6cf581fb05e624f452f' },
    'crewkite.x86_64.rpm': { platform: 'Linux x64, RPM', bytes: 200591360, sha256: '624481aae62c1783d42e488ead31cf0d794c0aeeaa522b85da42b239027ce43e' },
    'crewkite_arm64.deb': { platform: 'Linux arm64, DEB', bytes: 150282990, sha256: '67972b03985dd000c98774bf6b1fbe839dd412b83f9892bf6f5f194d20da71bf' },
    'crewkite.aarch64.rpm': { platform: 'Linux arm64, RPM', bytes: 200351481, sha256: 'e39551673ab9fc501a83de040bcbc35553ee6912a337377b369e000053983789' },
  },
};

// Sizes in MB (decimal, one place), the way the Worker formats them.
export const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;
export const UNRELEASED_LABEL = 'Available on release day';
