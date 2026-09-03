import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const faqs = await prepare('SELECT * FROM faqs ORDER BY "order"').all();
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching faqs:', error);
    res.status(500).json({ error: 'Failed to fetch faqs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { question, question_en, answer, answer_en, category, order } = req.body;
    const id = uuidv4();
    
    await prepare(`
      INSERT INTO faqs (id, question, question_en, answer, answer_en, category, "order")
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, question, question_en, answer, answer_en, category, order || 0);
    
    const faq = await prepare('SELECT * FROM faqs WHERE id = ?').get(id);
    res.status(201).json(faq);
  } catch (error) {
    console.error('Error creating faq:', error);
    res.status(500).json({ error: 'Failed to create faq' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { question, question_en, answer, answer_en, category, order } = req.body;
    
    await prepare(`
      UPDATE faqs SET question = ?, question_en = ?, answer = ?, answer_en = ?, category = ?, "order" = ?
      WHERE id = ?
    `).run(question, question_en, answer, answer_en, category, order || 0, req.params.id);
    
    const faq = await prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
    res.json(faq);
  } catch (error) {
    console.error('Error updating faq:', error);
    res.status(500).json({ error: 'Failed to update faq' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting faq:', error);
    res.status(500).json({ error: 'Failed to delete faq' });
  }
});

export default router;
