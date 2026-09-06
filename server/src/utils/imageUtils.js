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
  const cleanPath = imageUrl.startsWith('/images/') ? imageUrl.slice('/images/'.length) : imageUrl.replace(/^\//, '');

  const candidates = [
    path.join(publicDir, cleanPath),
    path.join(serverRoot, 'public', 'images', cleanPath),
    path.join(serverRoot, '..', 'public', 'images', cleanPath),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

/**
 * Downloads an image buffer over HTTP/HTTPS with redirect support
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return resolve(downloadImage(response.headers.location));
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Retrieves a resized image buffer with automatic fallback
 */
async function getImageBuffer(imageUrl, defaultWidth = 400, defaultHeight = 400) {
  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      const buffer = await downloadImage(imageUrl);
      return await sharp(buffer).resize(defaultWidth, defaultHeight, { fit: 'cover', position: 'center' }).toBuffer();
    } catch (error) {
      console.error('Error loading image from URL:', error);
    }
  }

  const imagePath = resolveImagePath(imageUrl);

  if (imagePath && fs.existsSync(imagePath)) {
    try {
      return await sharp(imagePath).resize(defaultWidth, defaultHeight, { fit: 'cover', position: 'center' }).toBuffer();
    } catch (error) {
      console.error('Error loading local image:', error);
    }
  }

  const placeholderPath = resolveImagePath('/images/cities/placeholder.png');
  if (placeholderPath && fs.existsSync(placeholderPath)) {
    try {
      return await sharp(placeholderPath).resize(defaultWidth, defaultHeight, { fit: 'cover', position: 'center' }).toBuffer();
    } catch (error) {
      console.error('Error loading placeholder image:', error);
    }
  }

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
            <stop offset="60%" stop-color="#000000" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
          </linearGradient>
        </defs>

        <!-- Bottom vignette for cinematic contrast -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bottomVignette)"/>

        <!-- Vertical divider line with shadow -->
        <line x1="${halfWidth}" y1="0" x2="${halfWidth}" y2="${height}" stroke="rgba(255,255,255,0.75)" stroke-width="2" filter="url(#shadow)"/>

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
      .webp({ quality: 82, effort: 4 })
      .toFile(filepath);

    const imageUrl = `/images/shuttles/${filename}`;
    console.log(`✨ Portada combinada de shuttle generada exitosamente: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error('Error generating shuttle image:', error);
    return null;
  }
}

/**
 * Safely removes a generated shuttle image when no longer used
 */
export async function deleteShuttleImage(imageUrl) {
  if (!imageUrl || !imageUrl.includes('/images/shuttles/')) {
    return;
  }

  try {
    const filepath = resolveImagePath(imageUrl);
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting shuttle image:', error);
  }
}
