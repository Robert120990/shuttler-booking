import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prepare } from '../db.js';

const router = express.Router();
const JWT_SECRET = 'trail-explorer-secret-key-2024';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error during login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const password_hash = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    
    await prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(id, name, email, password_hash);
    
    const user = await prepare('SELECT * FROM users WHERE id = ?').get(id);
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error during registration' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
