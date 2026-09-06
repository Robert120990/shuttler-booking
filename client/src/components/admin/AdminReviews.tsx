import { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Bus,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { reviewsApi, shuttlesApi } from '../../api/endpoints';
import type { Review, Shuttle } from '../../types';

export const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    fiveStarReviews: 0,
    approvedReviews: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [shuttleFilter, setShuttleFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    shuttle_id: '',
    user_name: '',
    user_email: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchData();
  }, [shuttleFilter, ratingFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, shuttlesRes] = await Promise.all([
        reviewsApi.getAllAdmin({
          shuttle_id: shuttleFilter || undefined,
          rating: ratingFilter ? Number(ratingFilter) : undefined,
        }),
        shuttlesApi.getAll(),
      ]);

      if (reviewsRes.data) {
        setReviews(reviewsRes.data.reviews || []);
        if (reviewsRes.data.metrics) {
          setMetrics(reviewsRes.data.metrics);
        }
      }
      if (shuttlesRes.data) {
        setShuttles(shuttlesRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching admin reviews data:', error);
      setFeedback({ type: 'error', message: 'Error al cargar las reseñas y rutas.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (review: Review) => {
    const nextStatus = review.status === 'approved' ? 'hidden' : 'approved';
    try {
      await reviewsApi.updateStatus(review.id, nextStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r))
      );
      setFeedback({
        type: 'success',
        message: `La reseña ahora está ${nextStatus === 'approved' ? 'aprobada y visible' : 'oculta del público'}.`,
      });
      fetchData();
    } catch (error) {
      console.error('Error updating review status:', error);
      setFeedback({ type: 'error', message: 'No se pudo actualizar el estado de la reseña.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta reseña?')) {
      return;
    }
    try {
      await reviewsApi.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setFeedback({ type: 'success', message: 'Reseña eliminada exitosamente.' });
      fetchData();
    } catch (error) {
      console.error('Error deleting review:', error);
      setFeedback({ type: 'error', message: 'Error al eliminar la reseña.' });
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.shuttle_id) {
      setFeedback({ type: 'error', message: 'Por favor selecciona la ruta de transporte.' });
      return;
    }
    if (!newReview.user_name.trim() || !newReview.comment.trim()) {
      setFeedback({ type: 'error', message: 'El nombre del viajero y el comentario son requeridos.' });
      return;
    }

    try {
      setSubmitting(true);
      await reviewsApi.createAdmin(newReview);
      setFeedback({ type: 'success', message: '¡Reseña manual agregada exitosamente!' });
      setShowAddModal(false);
      setNewReview({
        shuttle_id: '',
        user_name: '',
        user_email: '',
        rating: 5,
        comment: '',
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating review manually:', error);
      const msg = error.response?.data?.error || 'Error al crear la reseña.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (r.user_name || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q) ||
      (r.shuttle_name || '').toLowerCase().includes(q) ||
      (r.user_email || '').toLowerCase().includes(q);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Reseñas y Valoraciones</h1>
          <p className="text-slate-500 text-sm mt-1">
            Modera opiniones de viajeros, impulsa la confianza del sitio y añade testimonios reales.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddModal(true);
            setFeedback(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Reseña Manual</span>
        </Button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start justify-between gap-3 border text-xs font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total de Reseñas</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.totalReviews}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Promedio del Sistema</p>
              <h3 className="text-2xl font-bold text-slate-900">{(Number(metrics.averageRating) || 5.0).toFixed(1)} / 5.0</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Reseñas de 5 Estrellas</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.fiveStarReviews}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Reseñas Aprobadas</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.approvedReviews}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Buscar por viajero, ruta o comentario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs h-10"
              />
            </div>

            <div>
              <select
                value={shuttleFilter}
                onChange={(e) => setShuttleFilter(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                <option value="">Todas las rutas de transporte</option>
                {shuttles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                <option value="">Todas las valoraciones</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
                <option value="4">⭐⭐⭐⭐ (4 estrellas)</option>
                <option value="3">⭐⭐⭐ (3 estrellas)</option>
                <option value="2">⭐⭐ (2 estrellas)</option>
                <option value="1">⭐ (1 estrella)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table / Card List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reseñas Registradas ({filteredReviews.length})</CardTitle>
          <CardDescription>
            Lista de valoraciones dejadas por viajeros en las diferentes rutas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
              <Star className="w-8 h-8 text-amber-300 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-800 text-sm">No se encontraron reseñas</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hay valoraciones que coincidan con los filtros aplicados. Puedes agregar una reseña manualmente usando el botón superior.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Viajero</th>
                    <th className="py-3 px-4">Ruta (Shuttle)</th>
                    <th className="py-3 px-4">Calificación</th>
                    <th className="py-3 px-4">Comentario</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReviews.map((rev) => {
                    const dateFormatted = rev.created_at
                      ? new Date(rev.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—';

                    return (
                      <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {(rev.user_name || 'V').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div>{rev.user_name}</div>
                              {rev.user_email && (
                                <div className="text-[10px] text-slate-400 font-normal">{rev.user_email}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Bus className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rev.shuttle_name || 'Shuttle'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= Number(rev.rating) ? 'fill-current text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-bold text-slate-700 ml-1">{Number(rev.rating).toFixed(1)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={rev.comment}>
                          {rev.comment}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              rev.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rev.status === 'approved' ? 'Visible' : 'Oculta'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(rev)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                rev.status === 'approved'
                                  ? 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={rev.status === 'approved' ? 'Ocultar del público' : 'Hacer visible'}
                            >
                              {rev.status === 'approved' ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(rev.id)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar reseña"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Agregar Reseña Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Agregar Reseña Manual</h3>
                  <p className="text-xs text-slate-500">
                    Añade un testimonio o valoración recibida por WhatsApp, correo o redes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ruta de Transporte (Shuttle) *
                </label>
                <select
                  value={newReview.shuttle_id}
                  onChange={(e) => setNewReview({ ...newReview, shuttle_id: e.target.value })}
                  required
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  <option value="">Selecciona una ruta...</option>
                  {shuttles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${s.price} USD)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Viajero *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej. Carlos Mendoza"
                    value={newReview.user_name}
                    onChange={(e) => setNewReview({ ...newReview, user_name: e.target.value })}
                    required
                    className="text-xs h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <Input
                    type="email"
                    placeholder="cliente@email.com"
                    value={newReview.user_email}
                    onChange={(e) => setNewReview({ ...newReview, user_email: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Calificación (Estrellas) *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            newReview.rating >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {newReview.rating} de 5 estrellas
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comentario / Opinión del Cliente *
                </label>
                <textarea
                  rows={4}
                  placeholder="Escribe la opinión o testimonio del viajero..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Reseña</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminReviews;
