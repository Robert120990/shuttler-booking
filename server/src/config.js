import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');

export const DATA_DIR = process.env.DATA_DIR || serverRoot;
export const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001';

const defaultImagesDir = path.join(serverRoot, 'public', 'images');
export const IMAGES_DIR = process.env.IMAGES_DIR || defaultImagesDir;

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
