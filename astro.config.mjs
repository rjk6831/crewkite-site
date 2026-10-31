import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://crewkite.dev',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
});
