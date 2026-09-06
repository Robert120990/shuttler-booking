import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../i18n';
import { useContactStore } from '../../stores/contactStore';
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
  const { 
    contact_email, 
    contact_phone, 
    contact_address, 
    social_facebook, 
    social_instagram, 
    social_tiktok,
    fetchContactInfo,
    initialized 
  } = useContactStore();

  useEffect(() => {
    if (!initialized) {
      fetchContactInfo();
    }
  }, [initialized, fetchContactInfo]);

  const links = [
    { name: t('footer.faqs'), href: '/faqs' },
    { name: t('footer.terms'), href: '/terms' },
    { name: t('footer.privacy'), href: '/privacy' },
    { name: t('footer.cookies'), href: '/cookies' },
    { name: t('footer.contactUs'), href: '/contact' },
  ];

  const hasSocials = Boolean(social_facebook || social_instagram || social_tiktok);

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
            {hasSocials && (
              <div className="mt-4">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">{t('footer.followUs')}</span>
                <div className="flex items-center gap-3">
                  {social_facebook && (
                    <a
                      href={social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                      title="Facebook"
                    >
                      Facebook
                    </a>
                  )}
                  {social_instagram && (
                    <a
                      href={social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                      title="Instagram"
                    >
                      Instagram
                    </a>
                  )}
                  {social_tiktok && (
                    <a
                      href={social_tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                      title="TikTok"
                    >
                      TikTok
                    </a>
                  )}
                </div>
              </div>
            )}
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
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">
                  {contact_address || 'San Salvador, El Salvador'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a 
                  href={`mailto:${contact_email || 'info@trailexplorer.com'}`}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {contact_email || 'info@trailexplorer.com'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a 
                  href={`tel:${(contact_phone || '+503 1234 5678').replace(/\s+/g, '')}`}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {contact_phone || '+503 1234 5678'}
                </a>
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
