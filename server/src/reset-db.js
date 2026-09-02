import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { seedData } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/trailexplorer.db');

async function resetDatabase() {
  console.log('Resetting database...\n');
  
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Old database deleted.');
  }
  
  await initDb();
  await seedData();
  
  console.log('\nDatabase reset complete!');
}

resetDatabase().catch(console.error);
