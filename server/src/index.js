import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import countriesRoutes from './routes/countries.js';
import citiesRoutes from './routes/cities.js';
import shuttlesRoutes from './routes/shuttles.js';
import bookingsRoutes from './routes/bookings.js';
import faqsRoutes from './routes/faqs.js';
import uploadRoutes from './routes/upload.js';
import usersRoutes from './routes/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/shuttles', shuttlesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

await initDb();
const { seedData } = await import('./seed.js');
await seedData();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
