#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch (_) {}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceArg = process.argv.find((arg) => arg.startsWith('--source='));
const sourceDir = path.resolve(root, sourceArg ? sourceArg.split('=').slice(1).join('=') : 'chatgpt-visuals-inbox');
const promptPath = path.join(root, 'data', 'ai-visual-prompts.json');
const prompts = JSON.parse(fs.readFileSync(promptPath, 'utf8'));
const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dir, entry.name))
    .filter((file) => allowed.has(path.extname(file).toLowerCase()));
}

function findImageForSlug(files, slug) {
  const normalizedSlug = slug.toLowerCase();
  return files.find((file) => path.basename(file).toLowerCase().includes(normalizedSlug));
}

async function writeOutputs(src, item) {
  const pngPath = path.join(root, item.output);
  const webpPath = pngPath.replace(/\.png$/i, '.webp');
  ensureDir(pngPath);

  if (!sharp) {
    fs.copyFileSync(src, pngPath);
    return { png: path.relative(root, pngPath).replace(/\\/g, '/'), webp: '' };
  }

  await sharp(src).png().toFile(pngPath);
  await sharp(src).webp({ quality: 82 }).toFile(webpPath);
  return {
    png: path.relative(root, pngPath).replace(/\\/g, '/'),
    webp: path.relative(root, webpPath).replace(/\\/g, '/'),
  };
}

const files = listImages(sourceDir);
if (!files.length) {
  console.error(`No images found in ${path.relative(root, sourceDir).replace(/\\/g, '/') || sourceDir}`);
  console.error(
    'Run npm run images:prompts, generate/download images in ChatGPT, rename files to include each slug, then rerun npm run images:import.'
  );
  process.exit(1);
}

const manifest = [];
const missing = [];

for (const item of prompts) {
  const match = findImageForSlug(files, item.slug);
  if (!match) {
    missing.push(item.slug);
    continue;
  }
  const outputs = await writeOutputs(match, item);
  manifest.push({
    slug: item.slug,
    title: item.title,
    source: path.relative(root, match).replace(/\\/g, '/'),
    ...outputs,
    importedAt: new Date().toISOString(),
    usageNote:
      'Generated manually in ChatGPT subscription workflow; use only as diagram/editorial visual, not proof imagery.',
  });
  console.log(`Imported ${item.slug}: ${outputs.png}${outputs.webp ? `, ${outputs.webp}` : ''}`);
}

const manifestPath = path.join(root, 'data', 'ai-visual-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest written: ${path.relative(root, manifestPath).replace(/\\/g, '/')}`);

if (missing.length) {
  console.warn(`Missing images for: ${missing.join(', ')}`);
  process.exitCode = 1;
}
