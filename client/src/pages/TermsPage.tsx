import { useTranslation } from 'react-i18next';
import { SEO } from '../components/seo/SEO';

export const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title={t('legal.termsTitle')}
        description={t('legal.termsMeta')}
        path="/terms"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('legal.termsTitle')}</h1>
          <p className="text-sm text-slate-500">{t('legal.lastUpdated')}</p>
        </div>
        <div className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.termsSection1Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.termsSection1Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.termsSection2Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.termsSection2Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.termsSection3Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.termsSection3Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.termsSection4Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.termsSection4Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.termsSection5Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.termsSection5Desc')}
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t('legal.termsSection6Title')}</h2>
            <p className="text-slate-600 leading-relaxed">
              {t('legal.termsSection6Desc')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
