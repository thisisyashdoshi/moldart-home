let sharp = null;
try {
  sharp = require('sharp');
} catch (_) {}
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { PurgeCSS } = require('purgecss');

const WORK = __dirname;
const IMG = path.join(WORK, 'images');
const PUBLIC_OUT = path.join(WORK, 'public-site');
const CLOUDFLARE_PAGES_MAX_ASSET_BYTES = 25 * 1024 * 1024;

function replaceFile(src, dest) {
  try {
    fs.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EPERM' && err.code !== 'EACCES') throw err;
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
  }
}

function walkDirectory(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDirectory(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

async function generateAVIF() {
  if (!sharp) {
    console.log('Skipping AVIF generation (sharp unavailable)');
    return;
  }
  const allFiles = walkDirectory(IMG);
  const webpFiles = allFiles.filter(f => f.endsWith('.webp'));
  console.log(`Converting ${webpFiles.length} WebP images to AVIF...`);

  for (const src of webpFiles) {
    const dest = src.replace('.webp', '.avif');
    const stats = fs.statSync(src);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      continue;
    }

    try {
      await sharp(src)
        .avif({ quality: 50, effort: 2 })
        .toFile(dest);

      const newStats = fs.statSync(dest);
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
      console.log(`  ${path.relative(IMG, src)} → ${path.basename(dest)} (${(newStats.size/1024).toFixed(0)}KB, ${savings}% smaller)`);
    } catch (err) {
      console.error(`  FAIL ${path.relative(IMG, src)}: ${err.message}`);
    }
  }
}

async function compressOversized() {
  if (process.env.COMPRESS_LEGACY_IMAGES !== '1') {
    console.log('\nSkipping legacy oversized image compression (set COMPRESS_LEGACY_IMAGES=1 to enable)');
    return;
  }
  if (!sharp) {
    console.log('\nSkipping oversized image compression (sharp unavailable)');
    return;
  }
  const targets = [
    { file: 'page6_img4.webp', maxKB: 60 },
    { file: 'page6_img2.webp', maxKB: 60 },
  ];

  console.log('\nCompressing oversized images...');
  for (const { file, maxKB } of targets) {
    const src = path.join(IMG, file);
    if (!fs.existsSync(src)) continue;

    const origSize = fs.statSync(src).size;
    if (origSize <= maxKB * 1024) {
      console.log(`  ${file} already under ${maxKB}KB`);
      continue;
    }

    const tmp = src + '.tmp';
    // Try progressive quality reduction
    for (let q = 70; q >= 30; q -= 10) {
      await sharp(src).webp({ quality: q }).toFile(tmp);
      const newSize = fs.statSync(tmp).size;
      if (newSize <= maxKB * 1024 || q === 30) {
        try {
          replaceFile(tmp, src);
          console.log(`  ${file}: ${(origSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (q=${q})`);
        } catch (err) {
          if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
          console.warn(`  WARN ${file}: could not replace original file (${err.code || err.message}), keeping existing asset`);
        }
        break;
      }
      fs.unlinkSync(tmp);
    }
  }
}

async function convertImagesToWebP() {
  if (!sharp) {
    console.log('\nSkipping Image→WebP conversion (sharp unavailable)');
    return;
  }
  const allFiles = walkDirectory(IMG);
  const targets = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
  });
  console.log(`\nConverting ${targets.length} original images to WebP...`);
  for (const src of targets) {
    const ext = path.extname(src).toLowerCase();
    const dest = src.substring(0, src.length - ext.length) + '.webp';
    if (fs.existsSync(dest)) {
      continue;
    }
    try {
      await sharp(src).webp({ quality: 80 }).toFile(dest);
      const newSize = fs.statSync(dest).size;
      console.log(`  Converted ${path.relative(IMG, src)} → ${path.basename(dest)} (${(newSize/1024).toFixed(0)}KB)`);
    } catch (err) {
      console.error(`  FAIL ${path.relative(IMG, src)}: ${err.message}`);
    }
  }
}

function minifyCSS() {
  console.log('\nMinifying CSS...');
  const files = ['styles.css', 'pages.css', 'site-overrides.css'];
  for (const file of files) {
    const src = path.join(WORK, file);
    if (!fs.existsSync(src)) continue;
    const origSize = fs.statSync(src).size;
    try {
      execSync(`npx cleancss -o "${src}" "${src}"`, { cwd: WORK, stdio: 'pipe' });
      const newSize = fs.statSync(src).size;
      console.log(`  ${file}: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (${((1-newSize/origSize)*100).toFixed(1)}% savings)`);
    } catch (err) {
      console.log(`  skipping ${file} minification (cleancss unavailable or incomplete)`);
    }
  }
}

function bundleCSS() {
  console.log('\nBundling CSS...');
  const output = path.join(WORK, 'site.css');
  const inputs = ['styles.css', 'pages.css', 'site-overrides.css'].filter(file => fs.existsSync(path.join(WORK, file)));
  if (!inputs.length) return;
  const origSize = inputs.reduce((total, file) => total + fs.statSync(path.join(WORK, file)).size, 0);
  try {
    execSync(`npx cleancss -o "${output}" ${inputs.map(file => `"${path.join(WORK, file)}"`).join(' ')}`, { cwd: WORK, stdio: 'pipe' });
    const newSize = fs.statSync(output).size;
    console.log(`  site.css: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (${((1-newSize/origSize)*100).toFixed(1)}% savings)`);
  } catch (err) {
    fs.writeFileSync(output, inputs.map(file => fs.readFileSync(path.join(WORK, file), 'utf8')).join('\n'), 'utf8');
    const newSize = fs.statSync(output).size;
    console.log(`  site.css: fallback concat (${(newSize/1024).toFixed(1)}KB)`);
  }
}

function minifyJS() {
  console.log('\nMinifying JS...');
  const src = path.join(WORK, 'main.js');
  const origSize = fs.statSync(src).size;
  try {
    execSync(`npx terser "${src}" -o "${src}" -c -m`, { cwd: WORK, stdio: 'pipe' });
    const newSize = fs.statSync(src).size;
    console.log(`  main.js: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (${((1-newSize/origSize)*100).toFixed(1)}% savings)`);
  } catch (err) {
    console.log('  skipping JS minification (terser unavailable or incomplete)');
  }
}

async function buildHomeCSS() {
  console.log('\nBuilding homepage CSS...');
  const fullPath = path.join(WORK, 'site.css');
  const outputPath = path.join(WORK, 'home.css');
  const [result] = await new PurgeCSS().purge({
    content: ['index.html'],
    css: ['site.css'],
    safelist: {
      standard: [
        'is-active',
        'is-open',
        'is-visible',
        'open',
        'hidden',
        'scrolled',
        'scroll-locked',
        'lead-form-status',
        'text-emerald-600'
      ]
    }
  });
  if (!result?.css) throw new Error('PurgeCSS did not produce homepage CSS.');
  const homepageCss = result.css.replace(/@font-face\{[^}]*\}/g, '');
  if (homepageCss.includes('@font-face'))
    throw new Error('Homepage CSS still contains a render-delaying web-font declaration.');
  for (const requiredSelector of [
    '.home-hero-heading',
    '.home-browse-row',
    '.ui-footer',
    '.whatsapp-fab'
  ]) {
    if (!homepageCss.includes(requiredSelector))
      throw new Error(`Homepage CSS is missing required selector ${requiredSelector}.`);
  }
  const fullSize = fs.statSync(fullPath).size;
  fs.writeFileSync(outputPath, homepageCss, 'utf8');
  const homeSize = fs.statSync(outputPath).size;
  if (homeSize >= fullSize * 0.7)
    throw new Error(`Homepage CSS reduction is below guardrail (${homeSize} of ${fullSize} bytes).`);
  console.log(`  home.css: ${(fullSize/1024).toFixed(1)}KB → ${(homeSize/1024).toFixed(1)}KB (${((1-homeSize/fullSize)*100).toFixed(1)}% reduction)`);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFileIfExists(relPath) {
  const src = path.join(WORK, relPath);
  const dest = path.join(PUBLIC_OUT, relPath);
  if (!fs.existsSync(src)) return false;
  let stats;
  try {
    stats = fs.statSync(src);
  } catch (err) {
    console.warn(`  skipping unavailable file: ${relPath} (${err.code || err.message})`);
    return false;
  }
  if (!stats.isFile()) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function shouldCopyPublicFile(src) {
  const base = path.basename(src);
  const rel = path.relative(WORK, src).replace(/\\/g, '/');
  if (base === '.DS_Store') return false;
  if (base.includes('-YASH-LAPTOP')) return false;
  if (base.endsWith('.tmp')) return false;
  if (/^images\/insights\/editorial\//i.test(rel)) return false;
  if (/^images\/insights\/[^/]+\.png$/i.test(rel)) return false;
  if (/^images\/open-license\/.*-original\.(?:jpe?g|png|webp|avif)$/i.test(rel)) return false;
  let stats;
  try {
    stats = fs.statSync(src);
  } catch (err) {
    console.warn(`  skipping unavailable Cloud/OneDrive placeholder: ${path.relative(WORK, src)} (${err.code || err.message})`);
    return false;
  }
  if (stats.isFile() && stats.size > CLOUDFLARE_PAGES_MAX_ASSET_BYTES) {
    console.log(`  skipping oversized Cloudflare Pages asset: ${path.relative(WORK, src)}`);
    return false;
  }
  return true;
}

function copyDirIfExists(relPath) {
  const src = path.join(WORK, relPath);
  const dest = path.join(PUBLIC_OUT, relPath);
  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const entrySrc = path.join(src, entry.name);
    const entryDest = path.join(dest, entry.name);
    if (!shouldCopyPublicFile(entrySrc)) continue;
    if (entry.isDirectory()) {
      copyDirRecursive(entrySrc, entryDest);
    } else if (entry.isFile()) {
      ensureDir(path.dirname(entryDest));
      fs.copyFileSync(entrySrc, entryDest);
    }
  }
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const entrySrc = path.join(src, entry.name);
    const entryDest = path.join(dest, entry.name);
    if (!shouldCopyPublicFile(entrySrc)) continue;
    if (entry.isDirectory()) copyDirRecursive(entrySrc, entryDest);
    if (entry.isFile()) fs.copyFileSync(entrySrc, entryDest);
  }
}

function removePublicEntry(entryPath) {
  try {
    fs.rmSync(entryPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
    return;
  } catch (err) {
    if (err.code !== 'EPERM' && err.code !== 'EACCES') throw err;
    const trashDir = path.join(WORK, '.tmp', 'build-trash');
    ensureDir(trashDir);
    const trashPath = path.join(trashDir, `${Date.now()}-${path.basename(entryPath)}`);
    try {
      fs.renameSync(entryPath, trashPath);
      console.warn(`  moved locked public artifact to ${path.relative(WORK, trashPath)}`);
      return;
    } catch (renameErr) {
      console.warn(`  WARN could not remove ${path.relative(WORK, entryPath)} (${renameErr.code || renameErr.message})`);
    }
  }
}

function resetPublicArtifactDir() {
  ensureDir(PUBLIC_OUT);
  for (const entry of fs.readdirSync(PUBLIC_OUT, { withFileTypes: true })) {
    removePublicEntry(path.join(PUBLIC_OUT, entry.name));
  }
}

const APPROVED_PUBLIC_MEDIA_STATES = new Set([
  'APPROVED_REAL',
  'APPROVED_EDITED_REAL',
  'APPROVED_DIAGRAM',
  'USE_EXISTING'
]);
const REVIEW_MEDIA_REGISTER = JSON.parse(
  fs.readFileSync(path.join(WORK, 'internal', 'visual-prototype-media.json'), 'utf8')
);
const REVIEW_MEDIA_PATHS = new Set(
  (REVIEW_MEDIA_REGISTER.records || [])
    .filter(record => ['USE_EXISTING_REFERENCE', 'DIAGRAM', 'VIDEO_THUMBNAIL'].includes(record.status))
    .map(record => record.image)
    .filter(Boolean)
);

const LEGACY_REVIEW_MEDIA = [
  '/images/page5_img1.webp',
  '/images/page5_img2.webp',
  '/images/page5_img3.webp',
  '/images/page6_img1.webp',
  '/images/page6_img2.webp',
  '/images/page6_img3.webp',
  '/images/page6_img4.webp',
  '/images/page7_img1.webp',
  '/images/page7_img2.webp',
  '/images/page7_img3.webp',
  '/images/page7_img4.webp',
  '/images/page9_img1.webp',
  '/images/page9_img2.webp',
  '/images/page9_img2_clean.webp',
  '/images/page9_img3.webp',
  '/images/page9_img4.webp',
  '/images/press_pad_new.webp'
];

function removePublicMediaVariants(assetPath) {
  const relative = String(assetPath || '').replace(/^\/+/, '');
  if (!relative.startsWith('images/')) return;
  const parsed = path.parse(relative);
  for (const extension of ['.webp', '.avif', '.png', '.jpg', '.jpeg', '.svg']) {
    removePublicEntry(path.join(PUBLIC_OUT, parsed.dir, `${parsed.name}${extension}`));
  }
}

function sanitizePublicProductMedia() {
  const sourcePath = path.join(WORK, 'data', 'product-directory.json');
  const publicPath = path.join(PUBLIC_OUT, 'data', 'product-directory.json');
  if (!fs.existsSync(sourcePath) || !fs.existsSync(publicPath)) return;

  const directory = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const approvedPaths = new Set();
  for (const product of directory.products || []) {
    if (product.image && APPROVED_PUBLIC_MEDIA_STATES.has(product.mediaStatus)) {
      approvedPaths.add(product.image);
    } else if (product.image && REVIEW_MEDIA_PATHS.has(product.image)) {
      // Noindex visual prototype: retain the asset only for labelled Home/Products review cards.
    } else if (product.image) {
      removePublicMediaVariants(product.image);
    }
  }

  for (const candidate of LEGACY_REVIEW_MEDIA) {
    if (!approvedPaths.has(candidate) && !REVIEW_MEDIA_PATHS.has(candidate)) removePublicMediaVariants(candidate);
  }

  const publicDirectory = {
    ...directory,
    products: (directory.products || []).map((product) => {
      if (product.image && APPROVED_PUBLIC_MEDIA_STATES.has(product.mediaStatus)) {
        return product;
      }
      return {
        ...product,
        image: '',
        mediaStatus: 'OMITTED_PENDING_APPROVAL',
        mediaCaption: 'Approved product media is pending.'
      };
    })
  };
  fs.writeFileSync(publicPath, `${JSON.stringify(publicDirectory, null, 2)}\n`, 'utf8');
}

function applyNoindexReviewArtifact() {
  for (const file of walkDirectory(PUBLIC_OUT).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    const updated = html.replace(
      /<meta name="robots" content="[^"]*">/i,
      '<meta name="robots" content="noindex, nofollow, noarchive">'
    );
    fs.writeFileSync(file, updated, 'utf8');
  }
}

function executableInlineScripts(html) {
  const scripts = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1] || '';
    if (/\bsrc\s*=/i.test(attributes)) continue;
    const type = attributes.match(/\btype=["']([^"']+)/i)?.[1]?.toLowerCase() || '';
    if (type && !['text/javascript', 'application/javascript', 'module'].includes(type)) continue;
    scripts.push(match[2]);
  }
  return scripts;
}

function refreshPublicCspHashes() {
  const hashes = new Set();
  for (const file of walkDirectory(PUBLIC_OUT).filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    for (const script of executableInlineScripts(html)) {
      const digest = crypto.createHash('sha256').update(script, 'utf8').digest('base64');
      hashes.add(`'sha256-${digest}'`);
    }
  }
  const tokens = [...hashes].sort();
  if (!tokens.length) throw new Error('No executable inline scripts found for CSP hashing.');
  for (const headersPath of [path.join(WORK, '_headers'), path.join(PUBLIC_OUT, '_headers')]) {
    const headers = fs.readFileSync(headersPath, 'utf8');
    let changed = false;
    const updated = headers
      .split(/\r?\n/)
      .map((line) => {
        if (!line.includes('Content-Security-Policy:')) return line;
        const withoutOldHashes = line.replace(/\s+'sha256-[^']+'/g, '');
        const next = withoutOldHashes.replace("script-src 'self'", `script-src 'self' ${tokens.join(' ')}`);
        if (next === withoutOldHashes) throw new Error(`CSP script-src directive missing in ${headersPath}`);
        if (next.length > 2000) throw new Error(`CSP header line exceeds Cloudflare's 2,000-character limit (${next.length}).`);
        changed = true;
        return next;
      })
      .join('\n');
    if (!changed) throw new Error(`Content-Security-Policy header missing in ${headersPath}`);
    fs.writeFileSync(headersPath, updated, 'utf8');
  }
  console.log(`  CSP hashes refreshed for ${tokens.length} executable inline scripts`);
}

function copyPublicArtifact() {
  console.log('\nCreating public-only deployment artifact...');
  resetPublicArtifactDir();

  const files = [
    '404.html',
    '_headers',
    '_redirects',
    'apple-touch-icon.png',
    'build.json',
    'favicon.ico',
    'favicon-32x32.png',
    'favicon-48x48.png',
    'favicon-48x48-v2.png',
    'favicon-192x192.png',
    'favicon-512x512.svg',
    'home.css',
    'index.html',
    'llms.txt',
    'llms-full.txt',
    'lead-forms.js',
    'main.js',
    'pages.css',
    'site.css',
    'robots.txt',
    'sitemap.xml',
    'site-overrides.css',
    'site.webmanifest',
    'styles.css',
    'sw.js'
  ];

  for (const file of files) copyFileIfExists(file);

  for (const entry of fs.readdirSync(WORK)) {
    if (/^[a-f0-9]{32}\.txt$/i.test(entry)) copyFileIfExists(entry);
  }

  const dirs = [
    'about',
    'applications',
    'contact',
    'data',
    'downloads',
    'evidence-qc',
    'explore',
    'faq',
    'fonts',
    'images',
    'industry',
    'insights',
    'login',
    'products',
    'privacy',
    'process',
    'resources',
    'solutions',
    'terms'
  ];

  for (const dir of dirs) copyDirIfExists(dir);

  sanitizePublicProductMedia();
  applyNoindexReviewArtifact();

  for (const legacySlug of [
    'engraved-cylinders',
    'flooring-accessories',
    'custom-furniture',
    'ready-made-furniture',
    'ss-furniture'
  ]) {
    removePublicEntry(path.join(PUBLIC_OUT, 'products', legacySlug));
  }

  refreshPublicCspHashes();

  console.log(`  Public artifact ready at ${path.relative(WORK, PUBLIC_OUT)}/`);
  console.log('  Excluded private/runtime paths: trade-portal, node_modules, .next, .tmp, functions, netlify/functions');
}

function generatePages() {
  console.log('\nGenerating HTML pages...');
  const genScript = path.join(WORK, 'generate.js');
  if (!fs.existsSync(genScript)) {
    console.log('  generate.js not found, skipping');
    return;
  }
  execSync(`node "${genScript}"`, { cwd: WORK, stdio: 'inherit' });
  console.log('  Pages generated successfully');
}

async function main() {
  console.log('=== Moldart Build Pipeline ===\n');

  generatePages();
  await generateAVIF();
  await compressOversized();
  await convertImagesToWebP();
  minifyCSS();
  bundleCSS();
  minifyJS();
  await buildHomeCSS();
  copyPublicArtifact();

  console.log('\n=== Build complete ===');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
