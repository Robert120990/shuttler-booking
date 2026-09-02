import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DATA_DIR } from './config.js';

const dataDir = DATA_DIR;
const dbPath = join(dataDir, 'database.sqlite');

let db = null;

export async function initDb() {
  const SQL = await initSqlJs();
  
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS countries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      flag TEXT,
      description TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      country_id TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (country_id) REFERENCES countries(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shuttles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      origin_city_id TEXT NOT NULL,
      destination_city_id TEXT NOT NULL,
      price REAL NOT NULL,
      duration_hours REAL NOT NULL,
      schedule TEXT,
      availability TEXT DEFAULT 'Every day',
      availability_days TEXT DEFAULT '[0,1,2,3,4,5,6]',
      service_type TEXT DEFAULT 'local',
      description TEXT,
      included TEXT,
      to_bring TEXT,
      luggage_policy TEXT,
      luggage_options TEXT DEFAULT '[]',
      pickup_info TEXT,
      cancellation_policy TEXT,
      operator TEXT,
      pets_allowed INTEGER DEFAULT 0,
      image_url TEXT,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (origin_city_id) REFERENCES cities(id),
      FOREIGN KEY (destination_city_id) REFERENCES cities(id)
    )
  `);
  
  try { db.run('ALTER TABLE shuttles ADD COLUMN operator TEXT'); } catch (e) {}
  try { db.run('ALTER TABLE shuttles ADD COLUMN availability TEXT DEFAULT \'Every day\''); } catch (e) {}
  try { db.run('ALTER TABLE shuttles ADD COLUMN availability_days TEXT DEFAULT \'[0,1,2,3,4,5,6]\''); } catch (e) {}
  try { db.run('ALTER TABLE shuttles ADD COLUMN luggage_options TEXT DEFAULT \'[]\''); } catch (e) {}
  try { db.run('ALTER TABLE shuttles ADD COLUMN pickup_info TEXT'); } catch (e) {}
  try { db.run('ALTER TABLE shuttles ADD COLUMN cancellation_policy TEXT'); } catch (e) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      shuttle_id TEXT NOT NULL,
      date TEXT NOT NULL,
      pickup_location TEXT NOT NULL,
      dropoff_location TEXT NOT NULL,
      passenger_name TEXT,
      passenger_email TEXT,
      passenger_phone TEXT,
      seats INTEGER DEFAULT 1,
      extra_luggage INTEGER DEFAULT 0,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (shuttle_id) REFERENCES shuttles(id)
    )
  `);
  
  try {
    db.run('ALTER TABLE bookings ADD COLUMN extra_luggage INTEGER DEFAULT 0');
  } catch (e) {
  }

  try {
    db.run('ALTER TABLE bookings ADD COLUMN pickup_person_name TEXT');
  } catch (e) {
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      question_en TEXT,
      answer TEXT NOT NULL,
      answer_en TEXT,
      category TEXT,
      "order" INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    )
  `);

  saveDb();
  return db;
}

export function saveDb() {
  if (db) {
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export function getDb() {
  return db;
}

export function prepare(sql) {
  return {
    run: (...params) => {
      db.run(sql, params);
      saveDb();
      return { changes: db.getRowsModified() };
    },
    get: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },
    all: (...params) => {
      const results = [];
      const stmt = db.prepare(sql);
      stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }
  };
}
