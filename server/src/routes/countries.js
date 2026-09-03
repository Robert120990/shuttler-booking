import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const countries = await prepare('SELECT * FROM countries ORDER BY name').all();
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const country = await prepare('SELECT * FROM countries WHERE slug = ?').get(req.params.slug);
    if (!country) return res.status(404).json({ error: 'Country not found' });
    
    const cities = await prepare('SELECT * FROM cities WHERE country_id = ? ORDER BY name').all(country.id);

    // Shuttles saliendo desde este país
    const departureShuttles = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
        d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image,
        co_dest.name as dest_country_name, co_dest.slug as dest_country_slug
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      JOIN countries co_dest ON d.country_id = co_dest.id
      WHERE o.country_id = ?
      ORDER BY s.rating DESC, s.name ASC
    `).all(country.id);

    // Shuttles llegando hacia este país
    const arrivalShuttles = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
        d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image,
        co_orig.name as origin_country_name, co_orig.slug as origin_country_slug
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      JOIN countries co_orig ON o.country_id = co_orig.id
      WHERE d.country_id = ?
      ORDER BY s.rating DESC, s.name ASC
    `).all(country.id);

    res.json({
      ...country,
      cities,
      departureShuttles,
      arrivalShuttles,
    });
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ error: 'Failed to fetch country' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, slug, description, image_url } = req.body;
    const id = uuidv4();
    
    await prepare('INSERT INTO countries (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)').run(id, name, slug, description, image_url);
    
    const country = await prepare('SELECT * FROM countries WHERE id = ?').get(id);
    res.status(201).json(country);
  } catch (error) {
    console.error('Error creating country:', error);
    res.status(500).json({ error: 'Failed to create country' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    
    await prepare('UPDATE countries SET name = ?, description = ?, image_url = ? WHERE id = ?').run(name, description, image_url, req.params.id);
    
    const country = await prepare('SELECT * FROM countries WHERE id = ?').get(req.params.id);
    res.json(country);
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ error: 'Failed to update country' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prepare('DELETE FROM countries WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ error: 'Failed to delete country' });
  }
});

export default router;
