import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cities = await prepare(`
      SELECT c.*, co.name as country_name, co.slug as country_slug,
             co.is_available as country_is_available, co.description as country_description
      FROM cities c 
      JOIN countries co ON c.country_id = co.id 
      ORDER BY c.name
    `).all();

    const sorted = [...cities].sort((a, b) => {
      const aAvail = a.country_is_available !== 0 && a.country_is_available !== false;
      const bAvail = b.country_is_available !== 0 && b.country_is_available !== false;

      const aDesc = (a.country_description || '').toLowerCase();
      const bDesc = (b.country_description || '').toLowerCase();
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
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

router.get('/country/:countrySlug', async (req, res) => {
  try {
    const cities = await prepare(`
      SELECT c.* FROM cities c 
      JOIN countries co ON c.country_id = co.id 
      WHERE co.slug = ? 
      ORDER BY c.name
    `).all(req.params.countrySlug);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities by country:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const city = await prepare(`
      SELECT c.*, co.name as country_name, co.slug as country_slug 
      FROM cities c 
      JOIN countries co ON c.country_id = co.id 
      WHERE c.slug = ?
    `).get(req.params.slug);
    
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json(city);
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ error: 'Failed to fetch city' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, slug, country_id, description, image_url } = req.body;
    const id = uuidv4();
    
    await prepare('INSERT INTO cities (id, name, slug, country_id, description, image_url) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, slug, country_id, description, image_url);
    
    const city = await prepare('SELECT * FROM cities WHERE id = ?').get(id);
    res.status(201).json(city);
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ error: 'Failed to create city' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, image_url, country_id } = req.body;
    
    await prepare('UPDATE cities SET name = COALESCE(?, name), description = COALESCE(?, description), image_url = COALESCE(?, image_url), country_id = COALESCE(?, country_id) WHERE id = ?').run(name, description, image_url, country_id, req.params.id);
    
    const city = await prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id);
    res.json(city);
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ error: 'Failed to update city' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prepare('DELETE FROM cities WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

export default router;
