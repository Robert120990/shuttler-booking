import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Recalculates and updates the average rating and review count of a shuttle
 */
export async function recalculateShuttleRating(shuttleId) {
  try {
    const stats = await prepare(`
      SELECT 
        AVG(rating) as avg_rating, 
        COUNT(*) as total_count 
      FROM reviews 
      WHERE shuttle_id = ? AND status = 'approved'
    `).get(shuttleId);

    const count = Number(stats?.total_count || 0);
    const avg = count > 0 ? Math.round(Number(stats.avg_rating) * 10) / 10 : 5.0;

    await prepare(`
      UPDATE shuttles 
      SET rating = ?, review_count = ? 
      WHERE id = ?
    `).run(avg, count, shuttleId);

    return { rating: avg, review_count: count };
  } catch (err) {
    console.error(`Error recalculating rating for shuttle ${shuttleId}:`, err);
    return null;
  }
}

// =========================================================================
// PUBLIC ROUTES
// =========================================================================

/**
 * GET /api/reviews/shuttle/:shuttleId
 * Fetches approved reviews and rating summary statistics for a given shuttle
 */
router.get('/shuttle/:shuttleId', async (req, res) => {
  try {
    const { shuttleId } = req.params;

    // Resolve shuttle (supports either UUID or slug)
    const shuttle = await prepare(`
      SELECT id, name, rating, review_count FROM shuttles WHERE id = ? OR slug = ?
    `).get(shuttleId, shuttleId);

    if (!shuttle) {
      return res.status(404).json({ error: 'Ruta de transporte no encontrada' });
    }

    const realShuttleId = shuttle.id;

    // Fetch approved reviews
    const reviews = await prepare(`
      SELECT id, shuttle_id, user_name, user_email, rating, comment, status, created_at
      FROM reviews
      WHERE shuttle_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `).all(realShuttleId);

    // Compute distribution counts (5, 4, 3, 2, 1 stars)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += Number(r.rating);
    }

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? Math.round((sum / reviewCount) * 10) / 10 : Number(shuttle.rating) || 5.0;
    const recommendedCount = (distribution[5] || 0) + (distribution[4] || 0);
    const recommendedPercent = reviewCount > 0 ? Math.round((recommendedCount / reviewCount) * 100) : 100;

    res.json({
      reviews,
      stats: {
        averageRating,
        reviewCount,
        distribution,
        recommendedPercent,
      },
    });
  } catch (error) {
    console.error('Error fetching shuttle reviews:', error);
    res.status(500).json({ error: 'Error al cargar las reseñas de la ruta' });
  }
});

/**
 * POST /api/reviews/shuttle/:shuttleId
 * Allows travelers/customers to submit a new review for a shuttle
 */
router.post('/shuttle/:shuttleId', async (req, res) => {
  try {
    const { shuttleId } = req.params;
    const { user_name, user_email, rating, comment } = req.body;

    // Resolve shuttle (supports either UUID or slug)
    const shuttle = await prepare(`
      SELECT id, name FROM shuttles WHERE id = ? OR slug = ?
    `).get(shuttleId, shuttleId);

    if (!shuttle) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }

    const cleanName = (user_name || '').trim();
    const cleanComment = (comment || '').trim();
    const numRating = Number(rating);

    if (!cleanName) {
      return res.status(400).json({ error: 'Por favor ingresa tu nombre completo o apodo de viajero.' });
    }

    if (!cleanComment || cleanComment.length < 5) {
      return res.status(400).json({ error: 'Por favor escribe un comentario o reseña de al menos 5 caracteres sobre tu experiencia.' });
    }

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'La valoración debe ser una puntuación de 1 a 5 estrellas.' });
    }

    const reviewId = uuidv4();
    const cleanEmail = (user_email || '').trim() || null;
    const initialStatus = 'approved'; // Auto-approve valid traveler reviews

    await prepare(`
      INSERT INTO reviews (id, shuttle_id, user_name, user_email, rating, comment, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      reviewId,
      shuttle.id,
      cleanName,
      cleanEmail,
      Math.round(numRating),
      cleanComment,
      initialStatus
    );

    // Recalculate shuttle score
    const updatedStats = await recalculateShuttleRating(shuttle.id);

    const createdReview = await prepare(`
      SELECT id, shuttle_id, user_name, user_email, rating, comment, status, created_at
      FROM reviews
      WHERE id = ?
    `).get(reviewId);

    res.status(201).json({
      message: '¡Gracias por compartir tu reseña! Ha sido publicada exitosamente.',
      review: createdReview,
      updatedStats,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Error al registrar tu reseña' });
  }
});

// =========================================================================
// ADMIN MANAGEMENT ROUTES
// =========================================================================

/**
 * GET /api/reviews
 * Admin: list all reviews with optional shuttle and rating filters
 */
router.get('/', async (req, res) => {
  try {
    const { shuttle_id, rating, status } = req.query;

    let query = `
      SELECT 
        r.id, 
        r.shuttle_id, 
        r.user_name, 
        r.user_email, 
        r.rating, 
        r.comment, 
        r.status, 
        r.created_at,
        s.name as shuttle_name,
        s.slug as shuttle_slug
      FROM reviews r
      LEFT JOIN shuttles s ON r.shuttle_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (shuttle_id) {
      query += ` AND r.shuttle_id = ?`;
      params.push(shuttle_id);
    }

    if (rating) {
      query += ` AND r.rating = ?`;
      params.push(Number(rating));
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC`;

    const reviews = await prepare(query).all(...params);

    // Compute global metrics
    const totalCount = reviews.length;
    let fiveStarCount = 0;
    let sumRating = 0;
    let approvedCount = 0;

    for (const rev of reviews) {
      sumRating += Number(rev.rating);
      if (Number(rev.rating) === 5) fiveStarCount++;
      if (rev.status === 'approved') approvedCount++;
    }

    const avgGlobal = totalCount > 0 ? Math.round((sumRating / totalCount) * 10) / 10 : 5.0;

    res.json({
      reviews,
      metrics: {
        totalReviews: totalCount,
        averageRating: avgGlobal,
        fiveStarReviews: fiveStarCount,
        approvedReviews: approvedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ error: 'Error al obtener la lista de reseñas' });
  }
});

/**
 * POST /api/reviews/admin
 * Admin: manually add a review (for reviews collected via WhatsApp, TripAdvisor, etc.)
 */
router.post('/admin', async (req, res) => {
  try {
    const { shuttle_id, user_name, user_email, rating, comment } = req.body;

    if (!shuttle_id) {
      return res.status(400).json({ error: 'Debes seleccionar la ruta (shuttle) a la que pertenece la reseña.' });
    }

    const cleanName = (user_name || '').trim();
    const cleanComment = (comment || '').trim();
    const numRating = Number(rating);

    if (!cleanName || !cleanComment) {
      return res.status(400).json({ error: 'El nombre del viajero y el comentario son obligatorios.' });
    }

    const reviewId = uuidv4();
    await prepare(`
      INSERT INTO reviews (id, shuttle_id, user_name, user_email, rating, comment, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP)
    `).run(
      reviewId,
      shuttle_id,
      cleanName,
      (user_email || '').trim() || null,
      Math.min(5, Math.max(1, Math.round(numRating || 5))),
      cleanComment
    );

    await recalculateShuttleRating(shuttle_id);

    const created = await prepare(`
      SELECT r.*, s.name as shuttle_name 
      FROM reviews r
      LEFT JOIN shuttles s ON r.shuttle_id = s.id
      WHERE r.id = ?
    `).get(reviewId);

    res.status(201).json({ message: 'Reseña agregada exitosamente', review: created });
  } catch (error) {
    console.error('Error creating admin review:', error);
    res.status(500).json({ error: 'Error al crear la reseña' });
  }
});

/**
 * PATCH /api/reviews/:id/status
 * Admin: toggle review status between 'approved' and 'hidden'
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'hidden'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser approved u hidden.' });
    }

    const review = await prepare(`SELECT * FROM reviews WHERE id = ?`).get(id);
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    await prepare(`UPDATE reviews SET status = ? WHERE id = ?`).run(status, id);
    await recalculateShuttleRating(review.shuttle_id);

    res.json({ message: `Estado de la reseña actualizado a ${status}`, id, status });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la reseña' });
  }
});

/**
 * DELETE /api/reviews/:id
 * Admin: delete a review
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prepare(`SELECT * FROM reviews WHERE id = ?`).get(id);
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    const shuttleId = review.shuttle_id;
    await prepare(`DELETE FROM reviews WHERE id = ?`).run(id);
    await recalculateShuttleRating(shuttleId);

    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Error al eliminar la reseña' });
  }
});

export default router;
