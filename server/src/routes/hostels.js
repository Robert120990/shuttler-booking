import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all hostels with city and country info
router.get('/', async (req, res) => {
  try {
    const hostels = await prepare(`
      SELECT h.*, 
        c.name as city_name, c.slug as city_slug,
        co.name as country_name, co.slug as country_slug
      FROM hostels h
      JOIN cities c ON h.city_id = c.id
      JOIN countries co ON c.country_id = co.id
      ORDER BY co.name ASC, c.name ASC, h.name ASC
    `).all();
    res.json(hostels);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ error: 'Error al obtener los hostales' });
  }
});

// Get hostels by city ID or city slug
router.get('/city/:cityIdentifier', async (req, res) => {
  try {
    const { cityIdentifier } = req.params;
    const hostels = await prepare(`
      SELECT h.*, 
        c.name as city_name, c.slug as city_slug,
        co.name as country_name, co.slug as country_slug
      FROM hostels h
      JOIN cities c ON h.city_id = c.id
      JOIN countries co ON c.country_id = co.id
      WHERE h.city_id = ? OR c.slug = ?
      ORDER BY h.name ASC
    `).all(cityIdentifier, cityIdentifier);
    res.json(hostels);
  } catch (error) {
    console.error('Error fetching hostels for city:', error);
    res.status(500).json({ error: 'Error al obtener los hostales de la ciudad' });
  }
});

// Create hostel
router.post('/', async (req, res) => {
  try {
    const { name, city_id, address, phone } = req.body;
    
    if (!name || !city_id) {
      return res.status(400).json({ error: 'El nombre del hostal y la ciudad son obligatorios' });
    }

    const id = uuidv4();
    await prepare(`
      INSERT INTO hostels (id, name, city_id, address, phone)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), city_id, address?.trim() || null, phone?.trim() || null);

    const newHostel = await prepare(`
      SELECT h.*, 
        c.name as city_name, c.slug as city_slug,
        co.name as country_name, co.slug as country_slug
      FROM hostels h
      JOIN cities c ON h.city_id = c.id
      JOIN countries co ON c.country_id = co.id
      WHERE h.id = ?
    `).get(id);

    res.status(201).json(newHostel);
  } catch (error) {
    console.error('Error creating hostel:', error);
    res.status(500).json({ error: error.message || 'Error al crear el hostal' });
  }
});

// Update hostel
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city_id, address, phone } = req.body;

    const existing = await prepare('SELECT id FROM hostels WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Hostal no encontrado' });
    }

    await prepare(`
      UPDATE hostels
      SET name = COALESCE(?, name),
          city_id = COALESCE(?, city_id),
          address = ?,
          phone = ?
      WHERE id = ?
    `).run(name?.trim(), city_id, address?.trim() || null, phone?.trim() || null, id);

    const updatedHostel = await prepare(`
      SELECT h.*, 
        c.name as city_name, c.slug as city_slug,
        co.name as country_name, co.slug as country_slug
      FROM hostels h
      JOIN cities c ON h.city_id = c.id
      JOIN countries co ON c.country_id = co.id
      WHERE h.id = ?
    `).get(id);

    res.json(updatedHostel);
  } catch (error) {
    console.error('Error updating hostel:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar el hostal' });
  }
});

// Delete hostel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prepare('DELETE FROM hostels WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting hostel:', error);
    res.status(500).json({ error: 'Error al eliminar el hostal' });
  }
});

export default router;
