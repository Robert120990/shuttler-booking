import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface GooglePreferredBadgeProps {
  /**
   * The domain of the website to be set as preferred source.
   * If omitted, it will resolve from import.meta.env.VITE_SITE_URL or window.location.hostname.
   */
  domain?: string;
  /**
   * Visual variant:
   * - 'badge': Compact button with Google icon/star and standard styling
   * - 'card': Banner / card with title, explanation and prominent action button
   * - 'pill': Minimalist rounded pill suitable for headers, sidebars or inline tags
   */
  variant?: 'badge' | 'card' | 'pill';
  /**
   * Custom label text if overriding default translation.
   */
  customText?: string;
  /**
   * Additional custom CSS classes.
   */
  className?: string;
}

/**
 * Official Google 4-color 'G' Logo SVG
 */
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.36 7.36 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const GooglePreferredBadge: React.FC<GooglePreferredBadgeProps> = ({
  domain,
  variant = 'badge',
  customText,
  className = '',
}) => {
  const { t } = useTranslation();

  // Resolve target domain: explicit prop > VITE_SITE_URL > window host
  const rawDomain =
    domain ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
      ? import.meta.env.VITE_SITE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
      : typeof window !== 'undefined'
      ? window.location.hostname
      : 'trailexplorer.com');

  // Official Google Search deeplink for Preferred Sources
  const preferredUrl = `https://www.google.com/preferences/source?q=${encodeURIComponent(rawDomain)}`;

  const defaultActionText = t(
    'googlePreferred.buttonText',
    'Añádenos como fuente preferida en Google'
  );

  const titleText = customText || defaultActionText;

  if (variant === 'pill') {
    return (
      <a
        href={preferredUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={t('googlePreferred.tooltip', 'Seguir en Google Search y AI Overviews')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 shadow-sm
          bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow
          dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-slate-700
          ${className}`}
      >
        <GoogleIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
        <span className="truncate">{titleText}</span>
        <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0 ml-0.5 opacity-70" />
      </a>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-2xl p-5 border transition-all duration-200
          bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/70 text-white shadow-xl
          ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
            <GoogleIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-semibold text-white tracking-tight">
                {t('googlePreferred.cardTitle', 'Encuéntranos en Google Search')}
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                Google AI
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {t(
                'googlePreferred.cardDesc',
                'Añádenos a tus fuentes de confianza para ver nuestras rutas, shuttles e itinerarios directamente en tus resultados y resúmenes de IA.'
              )}
            </p>
            <a
              href={preferredUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200
                bg-white text-slate-900 hover:bg-slate-100 hover:shadow-lg active:scale-98"
            >
              <GoogleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{titleText}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Default 'badge' style
  return (
    <a
      href={preferredUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={t('googlePreferred.tooltip', 'Seguir en Google Search y AI Overviews')}
      className={`group inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200 shadow-sm
        bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md
        dark:bg-slate-800/90 dark:hover:bg-slate-800 dark:text-slate-100 dark:border-slate-700/80 dark:hover:border-slate-600
        ${className}`}
    >
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <GoogleIcon className="w-4 h-4" />
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 transition-transform duration-200 group-hover:scale-110" />
      </div>
      <span className="font-semibold">{titleText}</span>
      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
    </a>
  );
};

export default GooglePreferredBadge;
