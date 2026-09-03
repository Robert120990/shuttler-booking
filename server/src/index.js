import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb, prepare } from './db.js';
import authRoutes from './routes/auth.js';
import countriesRoutes from './routes/countries.js';
import citiesRoutes from './routes/cities.js';
import shuttlesRoutes from './routes/shuttles.js';
import bookingsRoutes from './routes/bookings.js';
import faqsRoutes from './routes/faqs.js';
import uploadRoutes from './routes/upload.js';
import usersRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import hostelsRoutes from './routes/hostels.js';
import { PUBLIC_URL, IMAGES_DIR, ensureDir } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

function syncSeedImages() {
  const repoImages = path.join(__dirname, '../public/images');
  if (!fs.existsSync(repoImages)) return;

  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return;
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        // Copy if dest doesn't exist or has 0 bytes
        if (!fs.existsSync(destPath) || fs.statSync(destPath).size === 0) {
          try {
            fs.copyFileSync(srcPath, destPath);
          } catch (err) {
            console.error(`Error copying image ${srcPath} to ${destPath}:`, err);
          }
        }
      }
    }
  };

  ensureDir(IMAGES_DIR);
  ensureDir(path.join(IMAGES_DIR, 'countries'));
  ensureDir(path.join(IMAGES_DIR, 'cities'));
  ensureDir(path.join(IMAGES_DIR, 'shuttles'));

  copyDir(repoImages, IMAGES_DIR);
}

app.use(cors());
app.use(express.json());

ensureDir(IMAGES_DIR);
syncSeedImages();

const repoImagesDir = path.join(__dirname, '../public/images');

// 1. Serve runtime & uploaded images from IMAGES_DIR (/data/images in production)
app.use('/images', express.static(IMAGES_DIR));

// 2. Fallback to repo static images directory
if (fs.existsSync(repoImagesDir)) {
  app.use('/images', express.static(repoImagesDir));
}

// 3. Fallback for any missing /images/* file: serve placeholder image instead of 404 JSON
const fallbackPlaceholder = path.join(repoImagesDir, 'cities', 'placeholder.png');
app.use('/images', (req, res, next) => {
  if (fs.existsSync(fallbackPlaceholder)) {
    return res.sendFile(fallbackPlaceholder);
  }
  res.status(404).end();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/shuttles', shuttlesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/hostels', hostelsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const countries = await prepare('SELECT slug, name FROM countries ORDER BY name').all();
    const cities = await prepare('SELECT slug, name FROM cities ORDER BY name').all();
    const shuttles = await prepare('SELECT slug, name FROM shuttles ORDER BY name').all();

    const baseUrl = PUBLIC_URL.replace(/\/$/, '');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    xml += `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`;
    xml += `<url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
    xml += `<url><loc>${baseUrl}/faqs</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`;

    for (const country of countries) {
      xml += `<url><loc>${baseUrl}/countries/${country.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }

    for (const city of cities) {
      xml += `<url><loc>${baseUrl}/cities/${city.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }

    for (const shuttle of shuttles) {
      xml += `<url><loc>${baseUrl}/shuttles/${shuttle.slug}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

const clientDistPath = process.env.CLIENT_DIST || path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/images/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start listening immediately so Railway health checks pass instantly
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  try {
    await initDb();
    const { seedData } = await import('./seed.js');
    await seedData();
    console.log('✨ Sistema y base de datos listos para procesar solicitudes.');
  } catch (err) {
    console.error('⚠️ Error inicializando base de datos:', err);
  }
});
