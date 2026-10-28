// Turns dist/cv/index.html into dist/Thomas-Lacquet-CV.pdf (A4). Run after `astro build`.
// Used when publishing (GitHub Actions). Needs Playwright's Chromium: `npx playwright install chromium`.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  try { res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${port}/cv/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const out = join(root, 'Thomas-Lacquet-CV.pdf');
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
const pages = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / (297 * 96 / 25.4)));
await browser.close();
server.close();
console.log(`CV: ${out} (${Math.round((await stat(out)).size / 1024)} KB, ~${pages} page(s) on screen)`);
