import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Phone, Send, CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SEO } from '../components/seo/SEO';
import { useContactStore } from '../stores/contactStore';

export const ContactPage = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const { 
    contact_email, 
    contact_phone, 
    contact_whatsapp, 
    contact_address, 
    contact_hours, 
    fetchContactInfo, 
    initialized 
  } = useContactStore();

  useEffect(() => {
    if (!initialized) {
      fetchContactInfo();
    }
  }, [initialized, fetchContactInfo]);

  const cleanWhatsapp = (contact_whatsapp || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title={t('contact.title')}
        description={t('contact.subtitle')}
        path="/contact"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.getInTouch')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900">{t('contact.officeLocation')}</h4>
                    <p className="text-slate-600">{contact_address || 'San Salvador, El Salvador'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900">{t('contact.email')}</h4>
                    <a 
                      href={`mailto:${contact_email || 'info@trailexplorer.com'}`}
                      className="text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      {contact_email || 'info@trailexplorer.com'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900">{t('contact.phone')}</h4>
                    <a 
                      href={`tel:${(contact_phone || '+503 1234 5678').replace(/\s+/g, '')}`}
                      className="text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      {contact_phone || '+503 1234 5678'}
                    </a>
                  </div>
                </div>
                {contact_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900">Horario de Atención</h4>
                      <p className="text-slate-600">{contact_hours}</p>
                    </div>
                  </div>
                )}
                {whatsappUrl && (
                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  </div>
                )}
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {t('contact.responseTime')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('contact.sendMessage')}</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('contact.thankYou')}</h3>
                  <p className="text-slate-600 mb-4">
                    {t('contact.responseTime')}
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    {t('common.edit')}
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input label={t('contact.name')} placeholder="Juan Pérez" required />
                  <Input label={t('contact.email')} type="email" placeholder="tu@correo.com" required />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.message')}</label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      rows={5}
                      placeholder={t('contact.message')}
                      required
                    />
                  </div>
                  <Button className="w-full" type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    {t('contact.send')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
