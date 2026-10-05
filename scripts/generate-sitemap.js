// Generates public/sitemap.xml from the <Route> definitions in src/App.jsx.
// lastmod = last git commit touching the route's component file, falling back
// to the date already in the sitemap, then today.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const SITE_URL = 'https://www.nearbystudio.in';
const EXCLUDE = new Set(['/adminbs']);
const ROOT = process.cwd();
const APP = path.join(ROOT, 'src/App.jsx');
const SITEMAP = path.join(ROOT, 'public/sitemap.xml');

const app = readFileSync(APP, 'utf8');

// Component name -> source file, from lazy imports
const files = {};
for (const [, name, rel] of app.matchAll(/const (\w+) = lazy\(\(\) => import\(["'](.+?)["']\)\)/g)) {
  const base = path.join(ROOT, 'src', rel);
  const file = ['', '.jsx', '.tsx', '.js', '.ts'].map((ext) => base + ext).find(existsSync);
  if (file) files[name] = file;
}

// Existing lastmods, used when git history is unavailable (e.g. shallow clones)
const previous = {};
if (existsSync(SITEMAP)) {
  for (const [, loc, mod] of readFileSync(SITEMAP, 'utf8').matchAll(/<loc>(.+?)<\/loc>\s*<lastmod>(.+?)<\/lastmod>/g)) {
    previous[loc] = mod;
  }
}

const today = new Date().toISOString().slice(0, 10);
const gitDate = (file) => {
  try {
    return execSync(`git log -1 --format=%cs -- "${file}"`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch {
    return '';
  }
};

const urls = [];
for (const [, route, element] of app.matchAll(/<Route path="([^"]+)" element=\{(.+?)\} \/>/g)) {
  if (EXCLUDE.has(route) || element.includes('<Navigate') || route !== route.toLowerCase()) continue;
  const component = element.match(/<(?!SEO\b)([A-Z]\w*)/)?.[1];
  const file = route === '/' ? APP : files[component];
  const loc = SITE_URL + (route === '/' ? '/' : route);
  const lastmod = (file && gitDate(file)) || previous[loc] || today;

  let priority = '0.7';
  let changefreq = 'monthly';
  if (route === '/') [priority, changefreq] = ['1.0', 'weekly'];
  else if (route === '/blog') [priority, changefreq] = ['0.8', 'weekly'];
  else if (route.startsWith('/blog/')) priority = '0.8';
  else if (['/podcast', '/studios', '/fashionshoot', '/greenscreenshoot', '/book'].includes(route)) priority = '0.9';
  else if (route === '/privacy-policy') [priority, changefreq] = ['0.3', 'yearly'];

  urls.push({ loc, lastmod, changefreq, priority });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(SITEMAP, xml);
console.log(`sitemap.xml: ${urls.length} URLs`);
