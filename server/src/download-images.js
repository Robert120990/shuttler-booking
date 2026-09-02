import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public/images');

const images = {
  countries: {
    'costa-rica': 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=800&q=80',
    'guatemala': 'https://images.unsplash.com/photo-1561501901-47b2c4b8c83d?w=800&q=80',
    'el-salvador': 'https://images.unsplash.com/photo-1558346489-19413928158b?w=800&q=80',
    'nicaragua': 'https://images.unsplash.com/photo-1583251633146-d0a3bda05cd8?w=800&q=80',
    'panama': 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=800&q=80',
    'mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80',
    'belize': 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=800&q=80',
    'honduras': 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=800&q=80',
  },
  cities: {
    'la-fortuna': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80',
    'monteverde': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80',
    'san-jose': 'https://images.unsplash.com/photo-1569793673926-d4c8a53e2a7c?w=600&q=80',
    'tamarindo': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    'puerto-viejo': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    'liberia': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    'antigua-guatemala': 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=600&q=80',
    'flores-peten': 'https://images.unsplash.com/photo-1561501901-47b2c4b8c83d?w=600&q=80',
    'panajachel': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    'quetzaltenango': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80',
    'guatemala-city': 'https://images.unsplash.com/photo-1569793673926-d4c8a53e2a7c?w=600&q=80',
    'el-tunco': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    'santa-ana': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    'san-salvador': 'https://images.unsplash.com/photo-1569793673926-d4c8a53e2a7c?w=600&q=80',
    'suchitoto': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    'granada': 'https://images.unsplash.com/photo-1517107972-f8f3f1684f9a?w=600&q=80',
    'leon': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80',
    'san-juan-del-sur': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    'managua': 'https://images.unsplash.com/photo-1569793673926-d4c8a53e2a7c?w=600&q=80',
    'bocas-del-toro': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    'boquete': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80',
    'panama-city': 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=600&q=80',
    'palenque': 'https://images.unsplash.com/photo-1561501901-47b2c4b8c83d?w=600&q=80',
    'san-cristobal-de-las-casas': 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=600&q=80',
    'belize-city': 'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=600&q=80',
    'san-ignacio': 'https://images.unsplash.com/photo-1561501901-47b2c4b8c83d?w=600&q=80',
    'copan-ruinas': 'https://images.unsplash.com/photo-1561501901-47b2c4b8c83d?w=600&q=80',
    'la-ceiba': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  },
  shuttles: {
    'la-fortuna-to-monteverde': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80',
    'la-fortuna-to-san-jose': 'https://images.unsplash.com/photo-1569793673926-d4c8a53e2a7c?w=600&q=80',
    'liberia-to-san-jose': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    'tamarindo-to-monteverde': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    'antigua-to-san-salvador': 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=600&q=80',
    'el-tunco-to-antigua': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    'monteverde-to-la-fortuna': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&q=80',
    'granada-to-leon': 'https://images.unsplash.com/photo-1517107972-f8f3f1684f9a?w=600&q=80',
  },
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        protocol.get(redirectUrl, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${filepath}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filepath}`);
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('Starting image download...\n');
  
  for (const [category, imagesObj] of Object.entries(images)) {
    const categoryDir = path.join(publicDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    for (const [name, url] of Object.entries(imagesObj)) {
      const ext = path.extname(new URL(url).pathname) || '.jpg';
      const filename = `${name}${ext}`;
      const filepath = path.join(categoryDir, filename);
      
      if (fs.existsSync(filepath)) {
        console.log(`Skipping (exists): ${filepath}`);
        continue;
      }
      
      try {
        await downloadImage(url, filepath);
      } catch (err) {
        console.error(`Error downloading ${url}:`, err.message);
      }
    }
  }
  
  console.log('\nImage download complete!');
}

downloadAllImages().catch(console.error);
