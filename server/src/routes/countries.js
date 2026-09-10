import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const countries = await prepare('SELECT * FROM countries ORDER BY name').all();
    const sorted = [...countries].sort((a, b) => {
      const aAvail = a.is_available !== 0 && a.is_available !== false;
      const bAvail = b.is_available !== 0 && b.is_available !== false;

      // Secondary check on description text if marked unavailable
      const aDesc = (a.description || '').toLowerCase();
      const bDesc = (b.description || '').toLowerCase();
      const aTextUnavail = aDesc.includes('no disponible') || aDesc.includes('not available') || aDesc.includes('unavailable') || aDesc.includes('no habilitado');
      const bTextUnavail = bDesc.includes('no disponible') || bDesc.includes('not available') || bDesc.includes('unavailable') || bDesc.includes('no habilitado');

      const aEffective = aAvail && !aTextUnavail;
      const bEffective = bAvail && !bTextUnavail;

      if (aEffective && !bEffective) return -1;
      if (!aEffective && bEffective) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
    res.json(sorted);
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
    const { name, slug, description, image_url, is_available } = req.body;
    const id = uuidv4();
    const resolvedAvailable = is_available !== undefined ? (is_available ? 1 : 0) : 1;
    
    await prepare('INSERT INTO countries (id, name, slug, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, slug, description, image_url, resolvedAvailable);
    
    const country = await prepare('SELECT * FROM countries WHERE id = ?').get(id);
    res.status(201).json(country);
  } catch (error) {
    console.error('Error creating country:', error);
    res.status(500).json({ error: 'Failed to create country' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, image_url, is_available } = req.body;
    const resolvedAvailable = is_available !== undefined ? (is_available ? 1 : 0) : 1;
    
    await prepare('UPDATE countries SET name = ?, description = ?, image_url = ?, is_available = ? WHERE id = ?').run(name, description, image_url, resolvedAvailable, req.params.id);
    
    const country = await prepare('SELECT * FROM countries WHERE id = ?').get(req.params.id);
    res.json(country);
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ error: 'Failed to update country' });
  }
});

// PATCH /api/countries/:id/toggle-availability
router.patch('/:id/toggle-availability', async (req, res) => {
  try {
    const country = await prepare('SELECT * FROM countries WHERE id = ?').get(req.params.id);
    if (!country) return res.status(404).json({ error: 'Country not found' });
    
    const currentAvailable = country.is_available !== 0 && country.is_available !== false;
    const newStatus = currentAvailable ? 0 : 1;

    await prepare('UPDATE countries SET is_available = ? WHERE id = ?').run(newStatus, req.params.id);
    const updated = await prepare('SELECT * FROM countries WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error toggling country availability:', error);
    res.status(500).json({ error: 'Failed to toggle country availability' });
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
