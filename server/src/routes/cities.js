import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', (req, res) => {
  const cities = prepare(`
    SELECT c.*, co.name as country_name, co.slug as country_slug 
    FROM cities c 
    JOIN countries co ON c.country_id = co.id 
    ORDER BY c.name
  `).all();
  res.json(cities);
});

router.get('/country/:countrySlug', (req, res) => {
  const cities = prepare(`
    SELECT c.* FROM cities c 
    JOIN countries co ON c.country_id = co.id 
    WHERE co.slug = ? 
    ORDER BY c.name
  `).all(req.params.countrySlug);
  res.json(cities);
});

router.get('/:slug', (req, res) => {
  const city = prepare(`
    SELECT c.*, co.name as country_name, co.slug as country_slug 
    FROM cities c 
    JOIN countries co ON c.country_id = co.id 
    WHERE c.slug = ?
  `).get(req.params.slug);
  
  if (!city) return res.status(404).json({ error: 'City not found' });
  res.json(city);
});

router.post('/', (req, res) => {
  const { name, slug, country_id, description, image_url } = req.body;
  const id = uuidv4();
  
  prepare('INSERT INTO cities (id, name, slug, country_id, description, image_url) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, slug, country_id, description, image_url);
  
  const city = prepare('SELECT * FROM cities WHERE id = ?').get(id);
  res.status(201).json(city);
});

router.put('/:id', (req, res) => {
  const { name, description, image_url } = req.body;
  
  prepare('UPDATE cities SET name = ?, description = ?, image_url = ? WHERE id = ?').run(name, description, image_url, req.params.id);
  
  const city = prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id);
  res.json(city);
});

router.delete('/:id', (req, res) => {
  prepare('DELETE FROM cities WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
