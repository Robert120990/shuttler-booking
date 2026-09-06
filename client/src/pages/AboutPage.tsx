import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Phone, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SEO } from '../components/seo/SEO';

export const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title={t('about.title')}
        description={t('about.metaDescription')}
        path="/about"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Trail Explorer',
            description: 'Shuttle booking platform across Central America',
            telephone: '+503 1234 5678',
            email: 'info@trailexplorer.com',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'San Salvador',
              addressCountry: 'SV',
            },
          },
        ]}
      />
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('about.heroTitle')}</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">{t('about.storyTitle')}</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('about.storyP1')}
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                {t('about.storyP2')}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {t('about.storyP3')}
              </p>
            </div>
            <div className="relative h-80 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
                alt="Central America landscapes"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{t('home.whyBook')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('about.safetyFirst')}</h3>
              <p className="text-sm text-slate-600">{t('about.safetyDesc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('about.doorToDoor')}</h3>
              <p className="text-sm text-slate-600">{t('about.doorDesc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('about.support247')}</h3>
              <p className="text-sm text-slate-600">{t('about.supportDesc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('about.easyBooking')}</h3>
              <p className="text-sm text-slate-600">{t('about.easyBookingDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.getInTouch')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900">{t('contact.officeLocation')}</h4>
                      <p className="text-slate-600">San Salvador, El Salvador</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900">{t('contact.email')}</h4>
                      <p className="text-slate-600">info@trailexplorer.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900">{t('contact.phone')}</h4>
                      <p className="text-slate-600">+503 1234 5678</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    {t('contact.responseTime')}
                  </p>
                </div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert(t('contact.thankYou')); }}>
                  <Input label={t('contact.name')} placeholder="Juan Pérez" required />
                  <Input label={t('contact.email')} type="email" placeholder="juan@ejemplo.com" required />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('contact.message')}</label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                      placeholder={t('contact.message')}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">{t('contact.send')}</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
