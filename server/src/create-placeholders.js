import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public/images');

async function generatePlaceholder(width, height, text, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#64748b"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

async function main() {
  const categories = ['countries', 'cities', 'shuttles'];
  
  console.log('Public dir:', publicDir);
  console.log('Server root:', __dirname);
  
  for (const category of categories) {
    const dir = path.join(publicDir, category);
    console.log(`Creating for ${category}:`, dir);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
    
    const placeholderPath = path.join(dir, 'placeholder.png');
    const displayName = category.charAt(0).toUpperCase() + category.slice(1);
    await generatePlaceholder(800, 600, displayName, placeholderPath);
    console.log(`Created placeholder for ${category} at ${placeholderPath}`);
    
    if (fs.existsSync(placeholderPath)) {
      console.log(`File exists: ${placeholderPath}`);
    } else {
      console.log(`File NOT found: ${placeholderPath}`);
    }
  }
  
  console.log('All placeholders created!');
}

main().catch(console.error);
