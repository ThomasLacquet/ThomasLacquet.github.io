import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import devDashboard from './src/dev/integration.mjs';

// The editor (/keystatic) only runs on your own computer with `npm run dev`.
// The published site stays fully static, without the editor.
const isDev = process.argv.includes('dev');

// Change `site` to your real domain before going live.
export default defineConfig({
  site: 'https://thomaslacquet.github.io',
  integrations: isDev ? [react(), keystatic(), devDashboard()] : [],
  // English at /, Dutch at /nl/. Components read Astro.currentLocale to pick the language.
  i18n: { defaultLocale: 'en', locales: ['en', 'nl'], routing: { prefixDefaultLocale: false } },
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
