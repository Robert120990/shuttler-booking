import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/seo/SEO';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12">
      <SEO
        title={t('notFound.title')}
        description={t('notFound.desc')}
        path="/404"
        noindex
      />
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-emerald-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('notFound.heading')}</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          {t('notFound.desc')}
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="w-5 h-5 mr-2" />
            {t('notFound.backToHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
