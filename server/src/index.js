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
import reviewsRoutes from './routes/reviews.js';
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
app.use('/api/reviews', reviewsRoutes);

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

app.get('*', async (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/images/')) {
    return res.status(404).json({ error: 'Not found' });
  }

  const indexPath = path.join(clientDistPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Application client not found');
  }

  try {
    let html = fs.readFileSync(indexPath, 'utf8');

    const host = req.get('host') || 'localhost:3001';
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const baseUrl = process.env.PUBLIC_URL ? process.env.PUBLIC_URL.replace(/\/$/, '') : `${protocol}://${host}`;
    const pageUrl = `${baseUrl}${req.originalUrl || req.path}`;

    let metaTitle = 'Trail Explorer - Shuttles y Transporte en Centroamérica';
    let metaDesc = 'Reserva shuttles compartidos y traslados turísticos en Costa Rica, Guatemala, El Salvador y toda Centroamérica. Reserva segura en minutos.';
    let rawImg = '/logo.jpeg';

    const cleanPath = req.path.replace(/\/$/, '');

    // 1. Shuttles preview (/shuttles/:param)
    const shuttleMatch = cleanPath.match(/^\/shuttles\/([^\/]+)$/);
    if (shuttleMatch) {
      const shuttleParam = shuttleMatch[1];
      try {
        const s = await prepare(`
          SELECT s.*,
                 o.name as origin_name, o.image_url as origin_image,
                 d.name as destination_name, d.image_url as destination_image
          FROM shuttles s
          JOIN cities o ON s.origin_city_id = o.id
          JOIN cities d ON s.destination_city_id = d.id
          WHERE s.id = ? OR s.slug = ?
        `).get(shuttleParam, shuttleParam);

        if (s) {
          metaTitle = `Shuttle ${s.origin_name} a ${s.destination_name} | Trail Explorer`;
          metaDesc = `Viaja cómodo y seguro de ${s.origin_name} a ${s.destination_name} por solo $${s.price} USD. Salidas programadas con aire acondicionado. Reserva en línea con confirmación inmediata.`;
          rawImg = s.image_url || s.destination_image || s.origin_image || '/logo.jpeg';
        }
      } catch (err) {
        console.error('Error querying shuttle for OpenGraph:', err);
      }
    }

    // 2. Cities preview (/cities/:slug)
    const cityMatch = cleanPath.match(/^\/cities\/([^\/]+)$/);
    if (cityMatch) {
      const citySlug = cityMatch[1];
      try {
        const c = await prepare(`
          SELECT c.*, co.name as country_name
          FROM cities c
          LEFT JOIN countries co ON c.country_id = co.id
          WHERE c.slug = ?
        `).get(citySlug);

        if (c) {
          metaTitle = `Shuttles y Transporte hacia ${c.name}${c.country_name ? `, ${c.country_name}` : ''} | Trail Explorer`;
          metaDesc = c.description || `Explora todas las rutas de shuttle, horarios y precios desde o hacia ${c.name}. Reserva tu viaje seguro en Centroamérica.`;
          rawImg = c.image_url || '/logo.jpeg';
        }
      } catch (err) {
        console.error('Error querying city for OpenGraph:', err);
      }
    }

    // 3. Countries preview (/countries/:slug)
    const countryMatch = cleanPath.match(/^\/countries\/([^\/]+)$/);
    if (countryMatch) {
      const countrySlug = countryMatch[1];
      try {
        const co = await prepare(`SELECT * FROM countries WHERE slug = ?`).get(countrySlug);
        if (co) {
          metaTitle = `Shuttles y Rutas Turísticas en ${co.name} | Trail Explorer`;
          metaDesc = co.description || `Encuentra las mejores conexiones de shuttle y transporte turístico en ${co.name}. Reserva fácil y rápido.`;
          rawImg = co.image_url || '/logo.jpeg';
        }
      } catch (err) {
        console.error('Error querying country for OpenGraph:', err);
      }
    }

    // Ensure image is absolute URL
    let metaImage = rawImg;
    if (metaImage && !metaImage.startsWith('http://') && !metaImage.startsWith('https://')) {
      metaImage = `${baseUrl}${metaImage.startsWith('/') ? '' : '/'}${metaImage}`;
    }

    // Escape special HTML chars in metadata
    const escapeHtml = (str) => String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const safeTitle = escapeHtml(metaTitle);
    const safeDesc = escapeHtml(metaDesc);
    const safeImage = escapeHtml(metaImage);
    const safeUrl = escapeHtml(pageUrl);

    // Replace <title> and description meta
    html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
    html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${safeDesc}" />`);

    // Build OpenGraph & Twitter tags
    const ogTags = `
    <!-- Dynamic OpenGraph & Social Media Meta Tags -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Trail Explorer" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:locale" content="es_ES" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
`;

    // Inject before </head>
    html = html.replace('</head>', `${ogTags}\n  </head>`);

    res.header('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error serving dynamic HTML:', error);
    res.sendFile(indexPath);
  }
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
