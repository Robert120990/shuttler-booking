import initSqlJs from 'sql.js';
import pg from 'pg';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DATA_DIR, ensureDir } from './config.js';

const { Pool } = pg;

const dataDir = DATA_DIR;
const dbPath = join(dataDir, 'database.sqlite');

let isPg = false;
let pgPool = null;
let sqliteDb = null;
let pgConnectionError = null;

export function getDbStatus() {
  const rawDbUrl =
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRESQL_URL ||
    process.env.SUPABASE_DATABASE_URL;

  return {
    isPg,
    type: isPg ? 'PostgreSQL (Supabase)' : 'SQLite Local (Temporal)',
    error: pgConnectionError,
    hasDbUrl: Boolean((rawDbUrl || '').trim()),
  };
}

async function initSqlite() {
  console.log('📁 Inicializando base de datos local SQLite...');
  ensureDir(dataDir);
  const SQL = await initSqlJs();
  
  if (existsSync(dbPath)) {
    try {
      const fileBuffer = readFileSync(dbPath);
      sqliteDb = new SQL.Database(fileBuffer);
    } catch (readErr) {
      console.error('Error leyendo SQLite existente, creando nueva:', readErr);
      sqliteDb = new SQL.Database();
    }
  } else {
    sqliteDb = new SQL.Database();
  }

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS countries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      flag TEXT,
      description TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      country_id TEXT NOT NULL REFERENCES countries(id),
      description TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shuttles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      origin_city_id TEXT NOT NULL REFERENCES cities(id),
      destination_city_id TEXT NOT NULL REFERENCES cities(id),
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      shuttle_id TEXT NOT NULL REFERENCES shuttles(id),
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
      boarding_status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'pay_on_arrival',
      payment_id TEXT,
      payment_details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      pickup_person_name TEXT
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      question_en TEXT,
      answer TEXT NOT NULL,
      answer_en TEXT,
      category TEXT,
      "order" INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city_id TEXT NOT NULL REFERENCES cities(id),
      address TEXT,
      phone TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      shuttle_id TEXT NOT NULL REFERENCES shuttles(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_email TEXT,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    sqliteDb.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON settings (key)');
    sqliteDb.run('CREATE INDEX IF NOT EXISTS idx_reviews_shuttle_id ON reviews (shuttle_id)');
    try {
      sqliteDb.run("ALTER TABLE bookings ADD COLUMN boarding_status TEXT DEFAULT 'pending'");
    } catch (colErr) {}
    try {
      sqliteDb.run("ALTER TABLE bookings ADD COLUMN payment_method TEXT DEFAULT 'pay_on_arrival'");
    } catch (colErr) {}
    try {
      sqliteDb.run("ALTER TABLE bookings ADD COLUMN payment_id TEXT");
    } catch (colErr) {}
    try {
      sqliteDb.run("ALTER TABLE bookings ADD COLUMN payment_details TEXT");
    } catch (colErr) {}
  } catch (e) {}

  saveDb();
  return sqliteDb;
}

export async function initDb() {
  const rawDbUrl =
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRESQL_URL ||
    process.env.SUPABASE_DATABASE_URL;

  const databaseUrl = (rawDbUrl || '').trim();

  // Only try PostgreSQL if databaseUrl exists and doesn't contain unfilled placeholder
  if (databaseUrl && !databaseUrl.includes('[YOUR-PASSWORD]') && !databaseUrl.includes('[tu-password]')) {
    try {
      console.log('🔌 Conectando a PostgreSQL (Base de datos en la nube)...');
      
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS countries (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            flag TEXT,
            description TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS cities (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            country_id TEXT NOT NULL REFERENCES countries(id),
            description TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS shuttles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            origin_city_id TEXT NOT NULL REFERENCES cities(id),
            destination_city_id TEXT NOT NULL REFERENCES cities(id),
            price NUMERIC NOT NULL,
            duration_hours NUMERIC NOT NULL,
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
            rating NUMERIC DEFAULT 5.0,
            review_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            shuttle_id TEXT NOT NULL REFERENCES shuttles(id),
            date TEXT NOT NULL,
            pickup_location TEXT NOT NULL,
            dropoff_location TEXT NOT NULL,
            passenger_name TEXT,
            passenger_email TEXT,
            passenger_phone TEXT,
            seats INTEGER DEFAULT 1,
            extra_luggage INTEGER DEFAULT 0,
            total_price NUMERIC NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_status TEXT DEFAULT 'pending',
            boarding_status TEXT DEFAULT 'pending',
            payment_method TEXT DEFAULT 'pay_on_arrival',
            payment_id TEXT,
            payment_details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            pickup_person_name TEXT
          );

          CREATE TABLE IF NOT EXISTS faqs (
            id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            question_en TEXT,
            answer TEXT NOT NULL,
            answer_en TEXT,
            category TEXT,
            "order" INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT
          );

          CREATE TABLE IF NOT EXISTS hostels (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            city_id TEXT NOT NULL REFERENCES cities(id),
            address TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            shuttle_id TEXT NOT NULL REFERENCES shuttles(id) ON DELETE CASCADE,
            user_name TEXT NOT NULL,
            user_email TEXT,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            status TEXT DEFAULT 'approved',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON settings (key);
          CREATE INDEX IF NOT EXISTS idx_reviews_shuttle_id ON reviews (shuttle_id);
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS boarding_status TEXT DEFAULT 'pending';
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pay_on_arrival';
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_details TEXT;
        `);
      } finally {
        client.release();
      }

      pgPool = pool;
      isPg = true;
      pgConnectionError = null;
      console.log('✅ PostgreSQL (Supabase) conectado e inicializado con éxito.');
      return pgPool;
    } catch (pgError) {
      const errLower = (pgError.message || '').toLowerCase();
      if (errLower.includes('enetunreach') || errLower.includes('network is unreachable') || (databaseUrl.includes('db.') && databaseUrl.includes('.supabase.co'))) {
        pgConnectionError = `Error de red IPv6 (${pgError.message}). Railway solo soporta IPv4. En Supabase debes usar el 'Connection Pooling' (Supavisor) con host 'aws-0-...pooler.supabase.com' (puerto 6543 o 5432) en lugar de la conexión directa db.xxx.supabase.co.`;
      } else if (errLower.includes('password authentication failed') || errLower.includes('authentication failed')) {
        pgConnectionError = `Error de autenticación: Contraseña de base de datos incorrecta en Supabase (${pgError.message}). Verifica tu contraseña en Supabase -> Project Settings -> Database.`;
      } else {
        pgConnectionError = `Error al conectar con PostgreSQL/Supabase: ${pgError.message}`;
      }

      console.error('⚠️ No se pudo conectar a PostgreSQL/Supabase:', pgConnectionError);
      console.log('🔄 Activando respaldo con base de datos local SQLite...');
      isPg = false;
      pgPool = null;
    }
  } else if (databaseUrl) {
    pgConnectionError = 'La variable DATABASE_URL contiene texto de ejemplo ([YOUR-PASSWORD] o [tu-password]). Reemplázalo por tu contraseña real de Supabase.';
    console.warn('⚠️ ' + pgConnectionError);
  } else {
    pgConnectionError = 'No se ha configurado la variable DATABASE_URL en Railway (Variables del servicio).';
  }

  return await initSqlite();
}

export function saveDb() {
  if (sqliteDb && !isPg) {
    try {
      ensureDir(dataDir);
      const data = sqliteDb.export();
      const buffer = Buffer.from(data);
      writeFileSync(dbPath, buffer);
    } catch (err) {
      console.error('Error guardando SQLite:', err);
    }
  }
}

export function getDb() {
  return isPg ? pgPool : sqliteDb;
}

const sanitizeParam = (val) => (val === undefined ? null : val);

function convertSqlForPg(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

export function prepare(sql) {
  return {
    run: async (...params) => {
      const cleanParams = params.map(sanitizeParam);
      if (isPg && pgPool) {
        const pgSql = convertSqlForPg(sql);
        const res = await pgPool.query(pgSql, cleanParams);
        return { changes: res.rowCount };
      } else {
        sqliteDb.run(sql, cleanParams);
        saveDb();
        return { changes: sqliteDb.getRowsModified() };
      }
    },
    get: async (...params) => {
      const cleanParams = params.map(sanitizeParam);
      if (isPg && pgPool) {
        const pgSql = convertSqlForPg(sql);
        const res = await pgPool.query(pgSql, cleanParams);
        return res.rows[0] || null;
      } else {
        const stmt = sqliteDb.prepare(sql);
        stmt.bind(cleanParams);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return null;
      }
    },
    all: async (...params) => {
      const cleanParams = params.map(sanitizeParam);
      if (isPg && pgPool) {
        const pgSql = convertSqlForPg(sql);
        const res = await pgPool.query(pgSql, cleanParams);
        return res.rows;
      } else {
        const results = [];
        const stmt = sqliteDb.prepare(sql);
        stmt.bind(cleanParams);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    }
  };
}
