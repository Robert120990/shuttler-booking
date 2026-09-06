import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../i18n';
import { translateCountryName } from '../../utils/shuttleTranslator';

const COUNTRIES = [
  { name: 'México', slug: 'mexico' },
  { name: 'Belice', slug: 'belize' },
  { name: 'Guatemala', slug: 'guatemala' },
  { name: 'El Salvador', slug: 'el-salvador' },
  { name: 'Honduras', slug: 'honduras' },
  { name: 'Nicaragua', slug: 'nicaragua' },
  { name: 'Costa Rica', slug: 'costa-rica' },
  { name: 'Panamá', slug: 'panama' },
];

export const Footer = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const links = [
    { name: t('footer.faqs'), href: '/faqs' },
    { name: t('footer.terms'), href: '/terms' },
    { name: t('footer.privacy'), href: '/privacy' },
    { name: t('footer.cookies'), href: '/cookies' },
    { name: t('footer.contactUs'), href: '/contact' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpeg" alt="Trail Explorer" className="h-9 w-auto object-contain rounded-md" />
              <span className="font-semibold text-white">Trail Explorer</span>
            </div>
            <p className="text-sm text-slate-400">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-4 mt-4">
              <span className="text-slate-400 text-sm">{t('footer.followUs')}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.explore')}</h3>
            <ul className="space-y-2">
              {COUNTRIES.map((country) => (
                <li key={country.slug}>
                  <Link
                    to={`/countries/${country.slug}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {translateCountryName(country.name, language)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                <span className="text-sm text-slate-400">
                  San Salvador, El Salvador
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">info@trailexplorer.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">+503 1234 5678</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Trail Explorer. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};
