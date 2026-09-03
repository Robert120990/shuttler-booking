import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { generateShuttleImage, deleteShuttleImage } from '../utils/imageUtils.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const shuttles = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug,
        d.name as destination_name, d.slug as destination_slug
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      ORDER BY s.created_at DESC
    `).all();
    res.json(shuttles);
  } catch (error) {
    console.error('Error fetching shuttles:', error);
    res.status(500).json({ error: 'Failed to fetch shuttles' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const shuttles = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug,
        d.name as destination_name, d.slug as destination_slug
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      ORDER BY s.rating DESC, s.review_count DESC
      LIMIT 6
    `).all();
    res.json(shuttles);
  } catch (error) {
    console.error('Error fetching featured shuttles:', error);
    res.status(500).json({ error: 'Failed to fetch featured shuttles' });
  }
});

router.get('/city/:citySlug', async (req, res) => {
  try {
    const city = await prepare('SELECT id FROM cities WHERE slug = ?').get(req.params.citySlug);
    if (!city) return res.status(404).json({ error: 'City not found' });
    
    const departure = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug,
        d.name as destination_name, d.slug as destination_slug
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      WHERE s.origin_city_id = ?
      ORDER BY s.created_at DESC
    `).all(city.id);
    
    const arrival = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug,
        d.name as destination_name, d.slug as destination_slug
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      WHERE s.destination_city_id = ?
      ORDER BY s.created_at DESC
    `).all(city.id);
    
    res.json({ departure, arrival });
  } catch (error) {
    console.error('Error fetching shuttles for city:', error);
    res.status(500).json({ error: 'Failed to fetch shuttles for city' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const shuttle = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
        d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      WHERE s.slug = ?
    `).get(req.params.slug);
    
    if (!shuttle) return res.status(404).json({ error: 'Shuttle not found' });
    res.json(shuttle);
  } catch (error) {
    console.error('Error fetching shuttle by slug:', error);
    res.status(500).json({ error: 'Failed to fetch shuttle' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { 
      name, slug, origin_city_id, destination_city_id, price, duration_hours, 
      schedule, availability, availability_days, service_type, description, included, to_bring,
      luggage_policy, luggage_options, pickup_info, cancellation_policy, 
      operator, pets_allowed, image_url 
    } = req.body;
    const id = uuidv4();

    let shuttleImageUrl = image_url;
    if (!shuttleImageUrl && origin_city_id && destination_city_id) {
      const originCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(origin_city_id);
      const destCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(destination_city_id);
      
      if (originCity && destCity) {
        const generatedImage = await generateShuttleImage(
          originCity.image_url,
          destCity.image_url
        );
        if (generatedImage) {
          shuttleImageUrl = generatedImage;
        }
      }
    }
    
    const autoSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    await prepare(`
      INSERT INTO shuttles (id, name, slug, origin_city_id, destination_city_id, price, duration_hours, schedule, availability, availability_days, service_type, description, included, to_bring, luggage_policy, luggage_options, pickup_info, cancellation_policy, operator, pets_allowed, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, autoSlug, origin_city_id, destination_city_id, price, duration_hours, 
      schedule, availability || 'Every day', availability_days || '[0,1,2,3,4,5,6]', service_type, description, included, to_bring,
      luggage_policy, luggage_options || '[]', pickup_info, cancellation_policy, 
      operator, pets_allowed ? 1 : 0, shuttleImageUrl
    );
    
    const shuttle = await prepare('SELECT * FROM shuttles WHERE id = ?').get(id);
    res.status(201).json(shuttle);
  } catch (error) {
    console.error('Error creating shuttle:', error);
    res.status(500).json({ error: 'Failed to create shuttle' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { 
      name, origin_city_id, destination_city_id, price, duration_hours, 
      schedule, availability, availability_days, service_type, description, included, to_bring,
      luggage_policy, luggage_options, pickup_info, cancellation_policy, 
      operator, pets_allowed, image_url 
    } = req.body;
    
    const existingShuttle = await prepare('SELECT * FROM shuttles WHERE id = ?').get(req.params.id);
    if (!existingShuttle) {
      return res.status(404).json({ error: 'Shuttle not found' });
    }
    
    let newImageUrl = image_url || existingShuttle.image_url;
    
    if (origin_city_id && destination_city_id && (!existingShuttle.image_url || existingShuttle.origin_city_id !== origin_city_id || existingShuttle.destination_city_id !== destination_city_id)) {
      const originCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(origin_city_id);
      const destCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(destination_city_id);
      
      if (originCity && destCity) {
        if (existingShuttle.image_url) {
          await deleteShuttleImage(existingShuttle.image_url);
        }
        const generatedImage = await generateShuttleImage(
          originCity.image_url,
          destCity.image_url
        );
        if (generatedImage) {
          newImageUrl = generatedImage;
        }
      }
    }
    
    await prepare(`
      UPDATE shuttles SET name = ?, origin_city_id = ?, destination_city_id = ?, price = ?, duration_hours = ?, schedule = ?, availability = ?, availability_days = ?, service_type = ?, description = ?, included = ?, to_bring = ?, luggage_policy = ?, luggage_options = ?, pickup_info = ?, cancellation_policy = ?, operator = ?, pets_allowed = ?, image_url = ?
      WHERE id = ?
    `).run(
      name, origin_city_id, destination_city_id, price, duration_hours, schedule, availability || 'Every day', availability_days || '[0,1,2,3,4,5,6]', service_type, 
      description, included, to_bring, luggage_policy, luggage_options || '[]', 
      pickup_info, cancellation_policy, operator, pets_allowed ? 1 : 0, newImageUrl, req.params.id
    );
    
    const shuttle = await prepare('SELECT * FROM shuttles WHERE id = ?').get(req.params.id);
    res.json(shuttle);
  } catch (error) {
    console.error('Error updating shuttle:', error);
    res.status(500).json({ error: 'Failed to update shuttle' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const shuttle = await prepare('SELECT image_url FROM shuttles WHERE id = ?').get(req.params.id);
    
    if (shuttle && shuttle.image_url) {
      await deleteShuttleImage(shuttle.image_url);
    }
    
    await prepare('DELETE FROM shuttles WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting shuttle:', error);
    res.status(500).json({ error: 'Failed to delete shuttle' });
  }
});

export default router;
