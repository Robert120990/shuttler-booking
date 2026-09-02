import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { generateShuttleImage, deleteShuttleImage } from '../utils/imageUtils.js';

const router = express.Router();

router.get('/', (req, res) => {
  const shuttles = prepare(`
    SELECT s.*, 
      o.name as origin_name, o.slug as origin_slug,
      d.name as destination_name, d.slug as destination_slug
    FROM shuttles s
    JOIN cities o ON s.origin_city_id = o.id
    JOIN cities d ON s.destination_city_id = d.id
    ORDER BY s.created_at DESC
  `).all();
  res.json(shuttles);
});

router.get('/featured', (req, res) => {
  const shuttles = prepare(`
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
});

router.get('/city/:citySlug', (req, res) => {
  const city = prepare('SELECT id FROM cities WHERE slug = ?').get(req.params.citySlug);
  if (!city) return res.status(404).json({ error: 'City not found' });
  
  const departure = prepare(`
    SELECT s.*, 
      o.name as origin_name, o.slug as origin_slug,
      d.name as destination_name, d.slug as destination_slug
    FROM shuttles s
    JOIN cities o ON s.origin_city_id = o.id
    JOIN cities d ON s.destination_city_id = d.id
    WHERE s.origin_city_id = ?
    ORDER BY s.created_at DESC
  `).all(city.id);
  
  const arrival = prepare(`
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
});

router.get('/:slug', (req, res) => {
  const shuttle = prepare(`
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
});

router.post('/', async (req, res) => {
  const { 
    name, slug, origin_city_id, destination_city_id, price, duration_hours, 
    schedule, availability, availability_days, service_type, description, included, to_bring,
    luggage_policy, luggage_options, pickup_info, cancellation_policy, 
    operator, pets_allowed, image_url 
  } = req.body;
  const id = uuidv4();

  let shuttleImageUrl = image_url;
  if (!shuttleImageUrl && origin_city_id && destination_city_id) {
    const originCity = prepare('SELECT image_url FROM cities WHERE id = ?').get(origin_city_id);
    const destCity = prepare('SELECT image_url FROM cities WHERE id = ?').get(destination_city_id);
    
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
  
  prepare(`
    INSERT INTO shuttles (id, name, slug, origin_city_id, destination_city_id, price, duration_hours, schedule, availability, availability_days, service_type, description, included, to_bring, luggage_policy, luggage_options, pickup_info, cancellation_policy, operator, pets_allowed, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, slug, origin_city_id, destination_city_id, price, duration_hours, 
    schedule, availability || 'Every day', availability_days || '[0,1,2,3,4,5,6]', service_type, description, included, to_bring,
    luggage_policy, luggage_options || '[]', pickup_info, cancellation_policy, 
    operator, pets_allowed ? 1 : 0, shuttleImageUrl
  );
  
  const shuttle = prepare('SELECT * FROM shuttles WHERE id = ?').get(id);
  res.status(201).json(shuttle);
});

router.put('/:id', async (req, res) => {
  const { 
    name, origin_city_id, destination_city_id, price, duration_hours, 
    schedule, availability, availability_days, service_type, description, included, to_bring,
    luggage_policy, luggage_options, pickup_info, cancellation_policy, 
    operator, pets_allowed, image_url 
  } = req.body;
  
  const existingShuttle = prepare('SELECT * FROM shuttles WHERE id = ?').get(req.params.id);
  if (!existingShuttle) {
    return res.status(404).json({ error: 'Shuttle not found' });
  }
  
  let newImageUrl = existingShuttle.image_url;
  
  if (origin_city_id && destination_city_id) {
    const originCity = prepare('SELECT image_url FROM cities WHERE id = ?').get(origin_city_id);
    const destCity = prepare('SELECT image_url FROM cities WHERE id = ?').get(destination_city_id);
    
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
  
  prepare(`
    UPDATE shuttles SET name = ?, origin_city_id = ?, destination_city_id = ?, price = ?, duration_hours = ?, schedule = ?, availability = ?, availability_days = ?, service_type = ?, description = ?, included = ?, to_bring = ?, luggage_policy = ?, luggage_options = ?, pickup_info = ?, cancellation_policy = ?, operator = ?, pets_allowed = ?, image_url = ?
    WHERE id = ?
  `).run(
    name, origin_city_id, destination_city_id, price, duration_hours, schedule, availability || 'Every day', availability_days || '[0,1,2,3,4,5,6]', service_type, 
    description, included, to_bring, luggage_policy, luggage_options || '[]', 
    pickup_info, cancellation_policy, operator, pets_allowed ? 1 : 0, newImageUrl, req.params.id
  );
  
  const shuttle = prepare('SELECT * FROM shuttles WHERE id = ?').get(req.params.id);
  res.json(shuttle);
});

router.delete('/:id', async (req, res) => {
  const shuttle = prepare('SELECT image_url FROM shuttles WHERE id = ?').get(req.params.id);
  
  if (shuttle && shuttle.image_url) {
    await deleteShuttleImage(shuttle.image_url);
  }
  
  prepare('DELETE FROM shuttles WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
