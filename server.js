require('dotenv').config();
const express = require('express');
const compression = require('compression');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const app = express();
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
// Always use GPT-5 model for all Codex sessions
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

app.use(compression());
// Cache strategy: vendor and images may be cached, but core HTML/CSS/JS should revalidate quickly in dev
// Static with cache headers
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d', etag: true }));
// Serve vendor assets for animations and icons
app.use('/vendor/aos', express.static(path.join(__dirname, 'node_modules', 'aos', 'dist'), { maxAge: '30d' }));
app.use('/vendor/animate.css', express.static(path.join(__dirname, 'node_modules', 'animate.css'), { maxAge: '30d' }));
app.use('/vendor/fontawesome', express.static(path.join(__dirname, 'node_modules', '@fortawesome', 'fontawesome-free'), { maxAge: '30d' }));
// Serve GSAP for advanced animations
      app.use('/vendor/gsap', express.static(path.join(__dirname, 'node_modules', 'gsap', 'dist'), { maxAge: '30d' }));
  // Serve Lenis for smooth scrolling
    app.use('/vendor/lenis', express.static(path.join(__dirname, 'node_modules', '@studio-freight', 'lenis', 'dist'), { maxAge: '30d' }));
  // Serve Lottie for vector animations
    app.use('/vendor/lottie', express.static(path.join(__dirname, 'node_modules', 'lottie-web', 'build'), { maxAge: '30d' }));
  // Serve Barba core for page transitions
    app.use('/vendor/barba', express.static(path.join(__dirname, 'node_modules', '@barba', 'core', 'dist'), { maxAge: '30d' }));
  // Serve Splitting.js for text/media splitting effects
    app.use('/vendor/splitting', express.static(path.join(__dirname, 'node_modules', 'splitting', 'dist'), { maxAge: '30d' }));
  // Serve Three.js for 3D/WebGL content
    app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules', 'three', 'build'), { maxAge: '30d' }));
app.use(express.json());

// Build portfolio items list from files in public/Images
app.get('/api/portfolio', async (req, res) => {
  try {
    const dir = path.join(__dirname, 'public', 'Images');
    const files = await fsp.readdir(dir);
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
        // Unknown prefix -> put in 'divers'
        const pretty = base.replace(/[_-]+/g, ' ').trim();
        items.push({ file: name, title: pretty || base, category: 'divers' });
      }
    }
    items.sort((a, b) => a.title.localeCompare(b.title, 'fr', { numeric: true, sensitivity: 'base' }));
    res.json({ items });
  } catch (e) {
    console.error('Error building portfolio from Images:', e);
    res.status(500).json({ error: 'Unable to read portfolio images' });
  }
});

app.post('/generate', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const completion = await openai.createCompletion({
      model: DEFAULT_MODEL,
      prompt,
      max_tokens: 100,
      temperature: 0.5,
    });
    res.json({ result: completion.data.choices[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating code' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
