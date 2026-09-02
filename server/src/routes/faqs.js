import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', (req, res) => {
  const faqs = prepare('SELECT * FROM faqs ORDER BY "order"').all();
  res.json(faqs);
});

router.post('/', (req, res) => {
  const { question, question_en, answer, answer_en, category, order } = req.body;
  const id = uuidv4();
  
  prepare(`
    INSERT INTO faqs (id, question, question_en, answer, answer_en, category, "order")
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, question, question_en, answer, answer_en, category, order || 0);
  
  const faq = prepare('SELECT * FROM faqs WHERE id = ?').get(id);
  res.status(201).json(faq);
});

router.put('/:id', (req, res) => {
  const { question, question_en, answer, answer_en, category, order } = req.body;
  
  prepare(`
    UPDATE faqs SET question = ?, question_en = ?, answer = ?, answer_en = ?, category = ?, "order" = ?
    WHERE id = ?
  `).run(question, question_en, answer, answer_en, category, order || 0, req.params.id);
  
  const faq = prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
  res.json(faq);
});

router.delete('/:id', (req, res) => {
  prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
