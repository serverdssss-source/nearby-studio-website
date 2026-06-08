import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Directories to recursively convert
const DIRS = [
  'public/book_our_show',
];

const SUPPORTED = ['.png', '.jpg', '.jpeg'];

async function convertImage(inputPath) {
  const ext = extname(inputPath).toLowerCase();
  if (!SUPPORTED.includes(ext)) return;

  const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log(`✅  ${basename(inputPath)} → ${basename(outputPath)}`);
  } catch (err) {
    console.error(`❌  Failed: ${inputPath}`, err.message);
  }
}

async function walkDir(dir) {
  const entries = await readdir(dir);
  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) await walkDir(full);
    else await convertImage(full);
  }
}

async function main() {
  console.log('🖼️  Converting book_our_show PNGs → WebP (quality 85)…\n');
  for (const d of DIRS) {
    console.log(`📁  ${d}`);
    await walkDir(join(ROOT, d));
  }
  console.log('\n✨  Done!');
}

main();
