import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', (req, res) => {
  const countries = prepare('SELECT * FROM countries ORDER BY name').all();
  res.json(countries);
});

router.get('/:slug', (req, res) => {
  const country = prepare('SELECT * FROM countries WHERE slug = ?').get(req.params.slug);
  if (!country) return res.status(404).json({ error: 'Country not found' });
  
  const cities = prepare('SELECT * FROM cities WHERE country_id = ? ORDER BY name').all(country.id);
  res.json({ ...country, cities });
});

router.post('/', (req, res) => {
  const { name, slug, description, image_url } = req.body;
  const id = uuidv4();
  
  prepare('INSERT INTO countries (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)').run(id, name, slug, description, image_url);
  
  const country = prepare('SELECT * FROM countries WHERE id = ?').get(id);
  res.status(201).json(country);
});

router.put('/:id', (req, res) => {
  const { name, description, image_url } = req.body;
  
  prepare('UPDATE countries SET name = ?, description = ?, image_url = ? WHERE id = ?').run(name, description, image_url, req.params.id);
  
  const country = prepare('SELECT * FROM countries WHERE id = ?').get(req.params.id);
  res.json(country);
});

router.delete('/:id', (req, res) => {
  prepare('DELETE FROM countries WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
