import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { IMAGES_DIR, ensureDir } from '../config.js';

const router = express.Router();

const publicDir = IMAGES_DIR;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
    }
  },
});

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const { type } = req.body;
    const allowedTypes = ['country', 'city', 'shuttle'];
    
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipo de imagen inválido. Use: country, city, o shuttle' });
    }

    const typeToFolder = { country: 'countries', city: 'cities', shuttle: 'shuttles' };
    const folderName = typeToFolder[type];
    const categoryDir = path.join(publicDir, folderName);
    
    ensureDir(categoryDir);

    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(categoryDir, filename);

    let width = 1920;
    let height = 1080;
    
    if (type === 'city') {
      width = 800;
      height = 600;
    } else if (type === 'shuttle') {
      width = 800;
      height = 600;
    }

    await sharp(req.file.buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    const imageUrl = `/images/${folderName}/${filename}`;

    res.json({
      success: true,
      url: imageUrl,
      filename,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

router.delete('/image', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL de imagen requerida' });
    }

    const relativePath = url.startsWith('/images/') ? url.slice('/images/'.length) : url.replace(/^\//, '');
    const filepath = path.join(publicDir, relativePath);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true, message: 'Imagen eliminada' });
    } else {
      res.status(404).json({ error: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Error al eliminar la imagen' });
  }
});

export default router;
