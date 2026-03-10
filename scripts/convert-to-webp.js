import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMAGE_DIRS = ['public/ImageGallery', 'public/Snapshots'];
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg'];

async function convertImage(inputPath) {
  const ext = extname(inputPath).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) return;

  const outputPath = inputPath.replace(ext, '.webp');
  
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✅ Converted: ${basename(inputPath)} → ${basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Failed to convert ${inputPath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await processDirectory(fullPath);
      } else if (stats.isFile()) {
        await convertImage(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Converting images to WebP format...\n');
  
  for (const dir of IMAGE_DIRS) {
    console.log(`📁 Processing: ${dir}`);
    await processDirectory(dir);
    console.log('');
  }
  
  console.log('✨ Conversion complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Update image paths in components to use .webp extension');
  console.log('2. Keep original images as fallback for older browsers');
  console.log('3. Use <picture> element for progressive enhancement');
}

main();
