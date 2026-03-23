import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const QUALITY = 80;
const MAX_WIDTH = 1920;

async function optimizeImage(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    await image
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
    
    console.log(`✓ Optimized: ${inputPath}`);
  } catch (error) {
    console.error(`✗ Failed: ${inputPath}`, error.message);
  }
}

async function processDirectory(dir) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const fullPath = join(dir, file);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      await processDirectory(fullPath);
    } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
      await optimizeImage(fullPath, fullPath);
    }
  }
}

console.log('🚀 Starting image optimization...\n');
await processDirectory('./public');
console.log('\n✅ All images optimized!');
