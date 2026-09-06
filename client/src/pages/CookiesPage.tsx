import { useTranslation } from 'react-i18next';
import { SEO } from '../components/seo/SEO';

export const CookiesPage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title={t('legal.cookiesTitle')}
        description={t('legal.cookiesMeta')}
        path="/cookies"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('legal.cookiesTitle')}</h1>
          <p className="text-sm text-slate-500">{t('legal.lastUpdated')}</p>
        </div>
        <div className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.cookiesSection1Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.cookiesSection1Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.cookiesSection2Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.cookiesSection2Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.cookiesSection3Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.cookiesSection3Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. {t('contact.getInTouch')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.cookiesMeta')} info@trailexplorer.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
