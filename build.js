const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');

// Configuration
const PUBLIC_DIR = path.join(__dirname, 'public');
const VENDOR_DIR = path.join(PUBLIC_DIR, 'vendor');
const NODE_MODULES = path.join(__dirname, 'node_modules');

// Asset mappings (Source in node_modules -> Destination in public/vendor)
const ASSETS = [
  { src: 'aos/dist', dest: 'aos' },
  { src: 'animate.css', dest: 'animate.css' },
  { src: '@fortawesome/fontawesome-free', dest: 'fontawesome' },
  { src: 'gsap/dist', dest: 'gsap' },
  { src: '@studio-freight/lenis/dist', dest: 'lenis' },
  { src: 'lottie-web/build', dest: 'lottie' },
  { src: '@barba/core/dist', dest: 'barba' },
  { src: 'splitting/dist', dest: 'splitting' },
  { src: 'three/build', dest: 'three' },
];

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

async function buildAssets() {
  console.log('📦 Building assets...');
  
  // Ensure vendor directory exists
  if (fs.existsSync(VENDOR_DIR)) {
    await fsp.rm(VENDOR_DIR, { recursive: true, force: true });
  }
  await fsp.mkdir(VENDOR_DIR, { recursive: true });

  for (const asset of ASSETS) {
    const srcPath = path.join(NODE_MODULES, asset.src);
    const destPath = path.join(VENDOR_DIR, asset.dest);

    if (fs.existsSync(srcPath)) {
        // specific handling for files vs directories
        const stats = await fsp.stat(srcPath);
        if (stats.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            // if it's a file, we need to ensure the destination directory exists if dest is a file path, 
            // but here our dest is a directory name inside vendor.
            // Wait, looking at the mapping: animate.css -> animate.css (folder usually?)
            // Let's check node_modules structure if possible, but standard copyDir should handle it if passed correctly.
            // If src is a file, we should copy it to the dest folder or Rename it? 
            // The mapping implies dest is the folder name inside vendor.
            // If src is a file: src: '.../animate.css', dest: 'animate.css' (folder) -> wait
            // server.js: app.use('/vendor/animate.css', express.static(path.join(__dirname, 'node_modules', 'animate.css'))); 
            // animate.css package root is a directory usually.
            await copyDir(srcPath, destPath);
        }
      console.log(`  Included: ${asset.dest}`);
    } else {
      console.warn(`  ⚠️ Missing: ${asset.src}`);
    }
  }
}

async function buildPortfolio() {
  console.log('🎨 Building portfolio data...');
  try {
    const dir = path.join(PUBLIC_DIR, 'Images');
    const files = await fsp.readdir(dir);
    
    // Logic copied from server.js
    const allowPrefixes = [
      { prefix: /^Collage|^Collag/i, category: 'collage', label: 'Collage' },
      { prefix: /^Gravure/i, category: 'gravure', label: 'Gravure' },
      { prefix: /^Peinture/i, category: 'peinture', label: 'Peinture' },
      { prefix: /^Pyro/i, category: 'pyro', label: 'Pyro' },
    ];
    const excludeExact = new Set(['Crow-Frame-1.webp','MePicAbout.jpg','ProfilePic.webp']);
    const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);
    const items = [];
    
    for (const name of files) {
      const ext = path.extname(name).toLowerCase();
      if (!exts.has(ext)) continue;
      if (excludeExact.has(name)) continue;
      
      const match = allowPrefixes.find(p => p.prefix.test(name));
      const base = path.basename(name, ext);
      
      if (match) {
        let suffix = base.replace(/^[A-Za-z]+/i, '');
        suffix = suffix.replace(/[-_]/g, ' ').trim();
        const prettyTitle = suffix ? `${match.label} ${suffix}` : match.label;
        items.push({ file: name, title: prettyTitle, category: match.category });
      } else {
        const pretty = base.replace(/[_-]+/g, ' ').trim();
        items.push({ file: name, title: pretty || base, category: 'divers' });
      }
    }
    
    items.sort((a, b) => a.title.localeCompare(b.title, 'fr', { numeric: true, sensitivity: 'base' }));
    
    const outputPath = path.join(PUBLIC_DIR, 'portfolio.json');
    await fsp.writeFile(outputPath, JSON.stringify({ items }, null, 2));
    console.log(`  Saved ${items.length} items to portfolio.json`);
    
  } catch (e) {
    console.error('Error building portfolio:', e);
    process.exit(1);
  }
}

async function main() {
  await buildAssets();
  await buildPortfolio();
  console.log('✅ Build complete!');
}

main();
