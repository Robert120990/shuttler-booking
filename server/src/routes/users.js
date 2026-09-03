import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { prepare } from '../db.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const password_hash = bcrypt.hashSync(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';

    await prepare(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, email, password_hash, userRole);

    const newUser = await prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const existing = await prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check email uniqueness if email is changed
    if (email) {
      const emailCheck = await prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
      if (emailCheck) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
    }

    if (password && password.trim() !== '') {
      const password_hash = bcrypt.hashSync(password, 10);
      await prepare(
        'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), password_hash = ? WHERE id = ?'
      ).run(name, email, role, password_hash, id);
    } else {
      await prepare(
        'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?'
      ).run(name, email, role, id);
    }

    const updatedUser = await prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
