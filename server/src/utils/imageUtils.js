import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { IMAGES_DIR, ensureDir } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '../..');

const publicDir = IMAGES_DIR;

/**
 * Resolves an image URL or relative path across all potential runtime and repo directories
 */
function resolveImagePath(imageUrl) {
  if (!imageUrl) return null;
  if (typeof imageUrl !== 'string') return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return null;

  // Strip query strings or cache busters
  const cleanUrl = imageUrl.split('?')[0];

  // If it's already an absolute file path that exists
  if (path.isAbsolute(cleanUrl) && fs.existsSync(cleanUrl)) {
    return cleanUrl;
  }

  const cleanPath = cleanUrl.startsWith('/images/') ? cleanUrl.slice('/images/'.length) : cleanUrl.replace(/^\//, '');

  const candidates = [
    path.join(publicDir, cleanPath),
    path.join(serverRoot, 'public', 'images', cleanPath),
    path.join(serverRoot, '..', 'public', 'images', cleanPath),
    path.join(process.cwd(), 'server', 'public', 'images', cleanPath),
    path.join(process.cwd(), 'public', 'images', cleanPath),
    `/data/images/${cleanPath}`,
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore filesystem access errors
    }
  }

  return candidates[0];
}

/**
 * Downloads an image buffer over HTTP/HTTPS with redirect and timeout support
 */
function downloadImage(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Demasiadas redirecciones al descargar imagen'));
    }

    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const req = protocol.get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TrailExplorer/1.0',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
          timeout: 8000,
        },
        (response) => {
          if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
            const redirectUrl = response.headers.location;
            if (!redirectUrl) {
              return reject(new Error('Redirección sin cabecera location'));
            }
            const nextUrl = redirectUrl.startsWith('http') ? redirectUrl : new URL(redirectUrl, url).toString();
            return resolve(downloadImage(nextUrl, maxRedirects - 1));
          }

          if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
            return reject(new Error(`Error HTTP al descargar imagen: ${response.statusCode}`));
          }

          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Tiempo de espera agotado al descargar imagen'));
      });

      req.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieves a resized image buffer with automatic fallback to placeholder or styled canvas
 */
async function getImageBuffer(imageUrl, defaultWidth = 400, defaultHeight = 400) {
  if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    try {
      const buffer = await downloadImage(imageUrl);
      return await sharp(buffer)
        .resize(defaultWidth, defaultHeight, { fit: 'cover', position: 'center' })
        .toBuffer();
    } catch (error) {
      console.warn(`Aviso: No se pudo descargar imagen remota (${imageUrl}):`, error.message);
    }
  }

  const imagePath = resolveImagePath(imageUrl);

  if (imagePath && fs.existsSync(imagePath)) {
    try {
      return await sharp(imagePath)
        .resize(defaultWidth, defaultHeight, { fit: 'cover', position: 'center' })
        .toBuffer();
    } catch (error) {
      console.warn(`Aviso: Error procesando imagen local (${imagePath}):`, error.message);
    }
  }

  // Fallback to placeholder image
  const placeholderCandidates = [
    resolveImagePath('/images/cities/placeholder.png'),
    resolveImagePath('/images/placeholder.png'),
    path.join(serverRoot, 'public', 'images', 'cities', 'placeholder.png'),
    path.join(serverRoot, 'public', 'images', 'placeholder.png'),
  ];

  for (const ph of placeholderCandidates) {
    if (ph && fs.existsSync(ph)) {
      try {
        return await sharp(ph)
          .resize(defaultWidth, defaultHeight, { fit: 'cover', position: 'center' })
          .toBuffer();
      } catch (err) {
        // Continue to canvas fallback
      }
    }
  }

  // Elegant dark slate canvas fallback
  return await sharp({
    create: {
      width: defaultWidth,
      height: defaultHeight,
      channels: 4,
      background: { r: 30, g: 41, b: 59, alpha: 1 },
    },
  }).png().toBuffer();
}

/**
 * Generates an optimized, premium composite route banner combining origin and destination city photos
 * Dimensions: 800 x 400 (2:1 aspect ratio) with SVG route divider, emerald arrow badge and bottom vignette
 */
export async function generateShuttleImage(originImageUrl, destinationImageUrl) {
  const shuttlesDir = path.join(publicDir, 'shuttles');
  ensureDir(shuttlesDir);

  // Also ensure server repo shuttles dir exists if publicDir is redirected
  const repoShuttlesDir = path.join(serverRoot, 'public', 'images', 'shuttles');
  ensureDir(repoShuttlesDir);

  const filename = `shuttle-${uuidv4()}.webp`;
  const filepath = path.join(shuttlesDir, filename);

  try {
    const width = 800;
    const height = 400;
    const halfWidth = width / 2;

    const [originBuffer, destinationBuffer] = await Promise.all([
      getImageBuffer(originImageUrl, halfWidth, height),
      getImageBuffer(destinationImageUrl, halfWidth, height),
    ]);

    // High-resolution SVG route overlay: Divider + Emerald Route Pill Badge + Subtle Vignette
    const svgOverlay = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
          <linearGradient id="bottomVignette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="60%" stop-color="#000000" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
          </linearGradient>
        </defs>

        <!-- Bottom vignette for cinematic contrast -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bottomVignette)"/>

        <!-- Vertical divider line with shadow -->
        <line x1="${halfWidth}" y1="0" x2="${halfWidth}" y2="${height}" stroke="rgba(255,255,255,0.8)" stroke-width="2" filter="url(#shadow)"/>

        <!-- Center route badge -->
        <g transform="translate(${halfWidth}, ${height / 2})" filter="url(#shadow)">
          <!-- Outer white ring -->
          <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
          <!-- Inner emerald circle -->
          <circle cx="0" cy="0" r="22" fill="#059669"/>
          <!-- Right directional route arrow -->
          <path d="M-6 -7 L3 0 L-6 7 M3 0 L-4 0" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgOverlay);

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      },
    })
      .composite([
        { input: originBuffer, left: 0, top: 0 },
        { input: destinationBuffer, left: halfWidth, top: 0 },
        { input: svgBuffer, left: 0, top: 0 },
      ])
      .webp({ quality: 84, effort: 4 })
      .toFile(filepath);

    // If repoShuttlesDir is a different location, copy it there too for dual persistence
    if (repoShuttlesDir !== shuttlesDir) {
      try {
        const repoFilepath = path.join(repoShuttlesDir, filename);
        fs.copyFileSync(filepath, repoFilepath);
      } catch {
        // Non-critical if copy fails
      }
    }

    const imageUrl = `/images/shuttles/${filename}`;
    console.log(`✨ Portada combinada de shuttle generada exitosamente: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error('Error generando imagen combinada de shuttle:', error);
    return null;
  }
}

/**
 * Safely removes a generated shuttle image when no longer used
 */
export async function deleteShuttleImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('/images/shuttles/')) {
    return;
  }

  try {
    const filepath = resolveImagePath(imageUrl);
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`🗑️ Imagen anterior eliminada: ${filepath}`);
    }
  } catch (error) {
    console.warn('Aviso: No se pudo eliminar imagen anterior de shuttle:', error.message);
  }
}
