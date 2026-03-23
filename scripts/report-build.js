import { readdir, stat } from 'fs/promises'
import { join } from 'path'

const DIST_DIR = 'dist'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

function extGroup(path) {
  if (path.endsWith('.js')) return 'js'
  if (path.endsWith('.css')) return 'css'
  if (path.endsWith('.webp') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.svg') || path.endsWith('.avif')) return 'images'
  if (path.endsWith('.mp4') || path.endsWith('.webm')) return 'videos'
  if (path.endsWith('.woff') || path.endsWith('.woff2')) return 'fonts'
  return 'other'
}

async function report() {
  const files = await walk(DIST_DIR)
  const buckets = { js: 0, css: 0, images: 0, videos: 0, fonts: 0, other: 0 }
  let total = 0

  const rows = []
  for (const file of files) {
    const info = await stat(file)
    total += info.size
    buckets[extGroup(file)] += info.size
    rows.push({ file, size: info.size })
  }

  rows.sort((a, b) => b.size - a.size)

  console.log('\nBuild Size Report')
  console.log('=================')
  console.log(`Total: ${formatBytes(total)}`)
  console.log(`JS: ${formatBytes(buckets.js)} | CSS: ${formatBytes(buckets.css)} | Images: ${formatBytes(buckets.images)} | Videos: ${formatBytes(buckets.videos)} | Fonts: ${formatBytes(buckets.fonts)} | Other: ${formatBytes(buckets.other)}`)
  console.log('\nTop 10 Largest Files:')
  rows.slice(0, 10).forEach((row, idx) => {
    console.log(`${String(idx + 1).padStart(2, '0')}. ${row.file} - ${formatBytes(row.size)}`)
  })
  console.log('')
}

report().catch((error) => {
  console.error('Failed to generate build report:', error)
  process.exit(1)
})
