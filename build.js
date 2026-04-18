let sharp = null;
try {
  sharp = require('sharp');
} catch (_) {}
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORK = __dirname;
const IMG = path.join(WORK, 'images');

function replaceFile(src, dest) {
  try {
    fs.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EPERM' && err.code !== 'EACCES') throw err;
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
  }
}

async function generateAVIF() {
  if (!sharp) {
    console.log('Skipping AVIF generation (sharp unavailable)');
    return;
  }
  const files = fs.readdirSync(IMG).filter(f => f.endsWith('.webp'));
  console.log(`Converting ${files.length} WebP images to AVIF...`);

  for (const file of files) {
    const src = path.join(IMG, file);
    const dest = path.join(IMG, file.replace('.webp', '.avif'));
    const stats = fs.statSync(src);

    try {
      await sharp(src)
        .avif({ quality: 50, effort: 6 })
        .toFile(dest);

      const newStats = fs.statSync(dest);
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
      console.log(`  ${file} → ${path.basename(dest)} (${(newStats.size/1024).toFixed(0)}KB, ${savings}% smaller)`);
    } catch (err) {
      console.error(`  FAIL ${file}: ${err.message}`);
    }
  }
}

async function compressOversized() {
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

async function convertJPGtoWebP() {
  if (!sharp) {
    console.log('\nSkipping JPG→WebP conversion (sharp unavailable)');
    return;
  }
  const jpgFiles = fs.readdirSync(IMG).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`\nConverting ${jpgFiles.length} JPG files to WebP...`);
  for (const file of jpgFiles) {
    const src = path.join(IMG, file);
    const dest = path.join(IMG, file.replace(/\.jpe?g$/, '.webp'));
    if (fs.existsSync(dest)) {
      console.log(`  ${file} → already has WebP version`);
      continue;
    }
    await sharp(src).webp({ quality: 80 }).toFile(dest);
    const newSize = fs.statSync(dest).size;
    console.log(`  ${file} → ${path.basename(dest)} (${(newSize/1024).toFixed(0)}KB)`);
  }
}

function minifyCSS() {
  console.log('\nMinifying CSS...');
  const files = ['styles.css', 'pages.css'];
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
  await convertJPGtoWebP();
  minifyCSS();
  minifyJS();

  console.log('\n=== Build complete ===');
}

main().catch(console.error);
