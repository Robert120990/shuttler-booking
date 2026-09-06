import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { generateShuttleImage, deleteShuttleImage } from '../utils/imageUtils.js';

const router = express.Router();

function formatShuttle(s) {
  if (!s) return s;
  const rawImg = s.image_url;
  const isInvalidImg = !rawImg || rawImg.trim() === '' || rawImg.includes('placeholder');
  const fallbackImg = s.destination_image || s.origin_image || '/placeholder.jpg';

  return {
    ...s,
    image_url: isInvalidImg ? fallbackImg : rawImg,
    origin_image: s.origin_image || null,
    destination_image: s.destination_image || null,
    price: Number(s.price),
    duration_hours: Number(s.duration_hours),
    rating: s.rating !== null && s.rating !== undefined ? Number(s.rating) : 5.0,
    review_count: Number(s.review_count) || 0,
    pets_allowed: Boolean(s.pets_allowed),
  };
}

router.get('/', async (req, res) => {
  try {
    const shuttles = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
        d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      ORDER BY s.created_at DESC
    `).all();
    res.json(shuttles.map(formatShuttle));
  } catch (error) {
    console.error('Error fetching shuttles:', error);
    res.status(500).json({ error: 'Failed to fetch shuttles' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const shuttles = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
        d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      ORDER BY s.rating DESC, s.review_count DESC
      LIMIT 6
    `).all();
    res.json(shuttles.map(formatShuttle));
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
        o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
        d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      WHERE s.origin_city_id = ?
      ORDER BY s.created_at DESC
    `).all(city.id);
    
    const arrival = await prepare(`
      SELECT s.*, 
        o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
        d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      WHERE s.destination_city_id = ?
      ORDER BY s.created_at DESC
    `).all(city.id);
    
    res.json({ departure: departure.map(formatShuttle), arrival: arrival.map(formatShuttle) });
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
      WHERE s.slug = ? OR s.id = ?
    `).get(req.params.slug, req.params.slug);
    
    if (!shuttle) return res.status(404).json({ error: 'Shuttle not found' });
    res.json(formatShuttle(shuttle));
  } catch (error) {
    console.error('Error fetching shuttle by slug:', error);
    res.status(500).json({ error: 'Failed to fetch shuttle' });
  }
});

async function getFullShuttleById(id) {
  return await prepare(`
    SELECT s.*, 
      o.name as origin_name, o.slug as origin_slug, o.image_url as origin_image,
      d.name as destination_name, d.slug as destination_slug, d.image_url as destination_image
    FROM shuttles s
    JOIN cities o ON s.origin_city_id = o.id
    JOIN cities d ON s.destination_city_id = d.id
    WHERE s.id = ?
  `).get(id);
}

router.post('/generate-fusion', async (req, res) => {
  try {
    const { origin_city_id, destination_city_id, shuttle_id } = req.body;
    if (!origin_city_id || !destination_city_id) {
      return res.status(400).json({ error: 'origin_city_id y destination_city_id son requeridos' });
    }

    const originCity = await prepare('SELECT name, image_url FROM cities WHERE id = ?').get(origin_city_id);
    const destCity = await prepare('SELECT name, image_url FROM cities WHERE id = ?').get(destination_city_id);

    if (!originCity || !destCity) {
      return res.status(404).json({ error: 'Una o ambas ciudades no fueron encontradas' });
    }

    const targetFilename = shuttle_id ? `shuttle-${shuttle_id}.webp` : null;
    const generatedImage = await generateShuttleImage(originCity.image_url, destCity.image_url, targetFilename);
    if (!generatedImage) {
      return res.status(500).json({ error: 'No se pudo generar la imagen de fusión de ruta' });
    }

    let updatedShuttle = null;
    if (shuttle_id) {
      const existing = await prepare('SELECT image_url FROM shuttles WHERE id = ?').get(shuttle_id);
      if (existing && existing.image_url && existing.image_url !== generatedImage) {
        await deleteShuttleImage(existing.image_url);
      }
      await prepare('UPDATE shuttles SET image_url = ? WHERE id = ?').run(generatedImage, shuttle_id);
      const fullShuttle = await getFullShuttleById(shuttle_id);
      if (fullShuttle) {
        updatedShuttle = formatShuttle(fullShuttle);
      }
    }

    res.json({
      success: true,
      image_url: generatedImage,
      shuttle: updatedShuttle,
    });
  } catch (error) {
    console.error('Error generando fusión de viaje:', error);
    res.status(500).json({ error: 'Error al generar la imagen de fusión' });
  }
});

router.post('/regenerate-all-fusion', async (req, res) => {
  try {
    const shuttles = await prepare(`
      SELECT s.id, s.name, s.image_url, s.origin_city_id, s.destination_city_id,
        o.image_url as origin_image, d.image_url as destination_image
      FROM shuttles s
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
    `).all();

    let updatedCount = 0;
    for (const shuttle of shuttles) {
      try {
        const generated = await generateShuttleImage(shuttle.origin_image, shuttle.destination_image, `shuttle-${shuttle.id}.webp`);
        if (generated) {
          if (shuttle.image_url && shuttle.image_url !== generated) {
            await deleteShuttleImage(shuttle.image_url);
          }
          await prepare('UPDATE shuttles SET image_url = ? WHERE id = ?').run(generated, shuttle.id);
          updatedCount++;
        }
      } catch (err) {
        console.warn(`Aviso: Error regenerando shuttle ${shuttle.id}:`, err.message);
      }
    }

    res.json({
      success: true,
      total: shuttles.length,
      updated: updatedCount,
    });
  } catch (error) {
    console.error('Error regenerando todas las fusiones:', error);
    res.status(500).json({ error: 'Error al regenerar fusiones' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { 
      name, slug, origin_city_id, destination_city_id, price, duration_hours, 
      schedule, availability, availability_days, service_type, description, included, to_bring,
      luggage_policy, luggage_options, pickup_info, cancellation_policy, 
      operator, pets_allowed, image_url, regenerate_image 
    } = req.body;
    const id = uuidv4();

    let shuttleImageUrl = image_url;
    const shouldGenerate = regenerate_image !== false && (
      !shuttleImageUrl || 
      shuttleImageUrl.trim() === '' || 
      shuttleImageUrl.includes('placeholder') || 
      shuttleImageUrl.includes('/cities/') ||
      regenerate_image === true
    );

    if (shouldGenerate && origin_city_id && destination_city_id) {
      const originCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(origin_city_id);
      const destCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(destination_city_id);
      
      if (originCity && destCity) {
        const generatedImage = await generateShuttleImage(
          originCity.image_url,
          destCity.image_url,
          `shuttle-${id}.webp`
        );
        if (generatedImage) {
          shuttleImageUrl = generatedImage;
        }
      }
    }
    
    const autoSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await prepare(`
      INSERT INTO shuttles (id, name, slug, origin_city_id, destination_city_id, price, duration_hours, schedule, availability, availability_days, service_type, description, included, to_bring, luggage_policy, luggage_options, pickup_info, cancellation_policy, operator, pets_allowed, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, autoSlug, origin_city_id, destination_city_id, price, duration_hours, 
      schedule, availability || 'Every day', availability_days || '[0,1,2,3,4,5,6]', service_type, description, included, to_bring,
      luggage_policy, luggage_options || '[]', pickup_info, cancellation_policy, 
      operator, pets_allowed ? 1 : 0, shuttleImageUrl
    );
    
    const fullShuttle = await getFullShuttleById(id);
    res.status(201).json(formatShuttle(fullShuttle));
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
      operator, pets_allowed, image_url, regenerate_image 
    } = req.body;
    
    const existingShuttle = await prepare('SELECT * FROM shuttles WHERE id = ?').get(req.params.id);
    if (!existingShuttle) {
      return res.status(404).json({ error: 'Shuttle not found' });
    }
    
    let newImageUrl = image_url !== undefined && image_url !== '' ? image_url : existingShuttle.image_url;
    
    // Check if origin or destination city was changed
    const citiesChanged = (origin_city_id && origin_city_id !== existingShuttle.origin_city_id) ||
                          (destination_city_id && destination_city_id !== existingShuttle.destination_city_id);

    // Determine if we should generate / regenerate the fusion banner:
    // 1) Explicitly requested: regenerate_image === true
    // 2) Origin or destination city changed
    // 3) Existing image is missing, empty, or placeholder
    // 4) Existing image was only a single city photo (/images/cities/...) instead of a route fusion banner
    // 5) If user didn't specify a custom image and existing image is not a /images/shuttles/ banner
    const shouldGenerate = origin_city_id && destination_city_id && (
      regenerate_image === true ||
      citiesChanged ||
      !newImageUrl ||
      newImageUrl.trim() === '' ||
      newImageUrl.includes('placeholder') ||
      newImageUrl.includes('/cities/') ||
      !newImageUrl.includes('/images/shuttles/')
    );

    if (shouldGenerate) {
      const originCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(origin_city_id);
      const destCity = await prepare('SELECT image_url FROM cities WHERE id = ?').get(destination_city_id);
      
      if (originCity && destCity) {
        if (existingShuttle.image_url && existingShuttle.image_url.includes('/images/shuttles/')) {
          await deleteShuttleImage(existingShuttle.image_url);
        }
        const targetFilename = existingShuttle.image_url && existingShuttle.image_url.includes('/images/shuttles/')
          ? path.basename(existingShuttle.image_url.split('?')[0])
          : `shuttle-${id}.webp`;
        const generatedImage = await generateShuttleImage(
          originCity.image_url,
          destCity.image_url,
          targetFilename
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
    
    const fullShuttle = await getFullShuttleById(req.params.id);
    res.json(formatShuttle(fullShuttle));
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
