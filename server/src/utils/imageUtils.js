import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { IMAGES_DIR, ensureDir } from '../config.js';

const publicDir = IMAGES_DIR;

function resolveImagePath(imageUrl) {
  if (!imageUrl) return null;
  const cleanPath = imageUrl.startsWith('/images/') ? imageUrl.slice('/images/'.length) : imageUrl.replace(/^\//, '');
  return path.join(publicDir, cleanPath);
}

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

async function getImageBuffer(imageUrl, defaultWidth = 400, defaultHeight = 300) {
  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      const buffer = await downloadImage(imageUrl);
      return await sharp(buffer).resize(defaultWidth, defaultHeight, { fit: 'cover' }).toBuffer();
    } catch (error) {
      console.error('Error loading from URL:', error);
    }
  }
  
  const imagePath = resolveImagePath(imageUrl);
  
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      return await sharp(imagePath).resize(defaultWidth, defaultHeight, { fit: 'cover' }).toBuffer();
    } catch (error) {
      console.error('Error loading local image:', error);
    }
  }
  
  const placeholderPath = path.join(publicDir, 'cities', 'placeholder.png');
  
  if (fs.existsSync(placeholderPath)) {
    return await sharp(placeholderPath).resize(defaultWidth, defaultHeight, { fit: 'cover' }).toBuffer();
  }
  
  return await sharp({
    create: {
      width: defaultWidth,
      height: defaultHeight,
      channels: 4,
      background: { r: 100, g: 116, b: 139, alpha: 1 }
    }
  }).png().toBuffer();
}

export async function generateShuttleImage(originImageUrl, destinationImageUrl) {
  const shuttlesDir = path.join(publicDir, 'shuttles');
  
  ensureDir(shuttlesDir);

  const filename = `shuttle-${uuidv4()}.webp`;
  const filepath = path.join(shuttlesDir, filename);

  try {
    const width = 800;
    const height = 300;
    const halfWidth = Math.floor(width / 2);

    const originBuffer = await getImageBuffer(originImageUrl, halfWidth, height);
    const destinationBuffer = await getImageBuffer(destinationImageUrl, halfWidth, height);

    await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 100, g: 116, b: 139, alpha: 1 }
      }
    })
      .composite([
        { input: originBuffer, left: 0, top: 0 },
        { input: destinationBuffer, left: halfWidth, top: 0 }
      ])
      .webp({ quality: 80 })
      .toFile(filepath);

    const imageUrl = `/images/shuttles/${filename}`;
    return imageUrl;
  } catch (error) {
    console.error('Error generating shuttle image:', error);
    return null;
  }
}

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
