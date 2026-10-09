// Writes a static HTML file per sitemap URL so crawlers that don't run JavaScript
// (GPTBot, ClaudeBot, PerplexityBot, link previews) see each page's text and meta tags.
// Runs after `vite build` and `vite build --ssr src/entry-server.jsx --outDir dist-ssr`.
// The browser still renders the app from scratch; see the data-prerendered handling in
// index.html and src/main.jsx.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, 'dist-ssr');
const SITE_URL = 'https://www.nearbystudio.in';

const template = readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: #root not found in dist/index.html');

// Unknown routes (admin, old capitalised URLs) are rewritten to this untouched shell
writeFileSync(path.join(DIST, 'spa.html'), template);

const { render } = await import(pathToFileURL(path.join(SSR_DIR, 'entry-server.js')).href);

const routes = [...readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8').matchAll(/<loc>(.+?)<\/loc>/g)]
  .map(([, loc]) => loc.replace(SITE_URL, '') || '/');

for (const route of routes) {
  const { html, helmet } = await render(route);
  const head = helmet
    ? ['title', 'meta', 'link', 'script'].map((key) => helmet[key].toString()).join('\n  ')
    : '';

  const page = template
    .replace(/<title>.*?<\/title>/, head)
    .replace('<div id="root"></div>', `<div id="root" data-prerendered>${html}</div>`);

  const outDir = path.join(DIST, route);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'index.html'), page);
}

rmSync(SSR_DIR, { recursive: true, force: true });
console.log(`prerender: ${routes.length} pages`);
