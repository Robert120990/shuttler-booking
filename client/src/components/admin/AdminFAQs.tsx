import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { faqsApi } from '../../api/endpoints';
import type { FAQ } from '../../types';

export const AdminFAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await faqsApi.getAll();
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({ question: faq.question, answer: faq.answer, category: (faq as any).category || '' });
    } else {
      setEditingFaq(null);
      setFormData({ question: '', answer: '', category: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaq(null);
    setFormData({ question: '', answer: '', category: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingFaq) {
        await faqsApi.update(editingFaq.id, formData);
      } else {
        await faqsApi.create(formData);
      }
      await fetchFaqs();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await faqsApi.delete(id);
        await fetchFaqs();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        alert('Error deleting FAQ. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">FAQs</h1>
          <p className="text-slate-500 text-sm sm:text-base">Gestiona las preguntas frecuentes</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Agregar FAQ
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpand(faq.id)}
                >
                  <div>
                    <span className="text-sm text-emerald-600 font-medium">{(faq as any).category || 'General'}</span>
                    <h3 className="font-medium text-slate-900 mt-1">{faq.question}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenModal(faq); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedId === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
                {expandedId === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
            {faqs.length === 0 && (
              <p className="text-center py-8 text-slate-500">No FAQs found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                label="Question" 
                placeholder="Enter the question" 
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
              <Input 
                label="Answer" 
                placeholder="Enter the answer" 
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              />
              <Input 
                label="Category" 
                placeholder="e.g., Booking, Payment, Travel" 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving || !formData.question || !formData.answer}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
