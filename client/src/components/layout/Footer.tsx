import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ShieldCheck, Wallet, Lock } from 'lucide-react';
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

        {/* Insignias de Formas de Pago y Seguridad */}
        <div className="border-t border-slate-800 mt-10 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  {language === 'es' ? 'Métodos de Pago Aceptados' : 'Accepted Payment Methods'}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {language === 'es' 
                    ? 'Paga con tarjeta, PayPal, Wompi o en efectivo al abordar tu shuttle.' 
                    : 'Pay online via card, PayPal, Wompi or pay cash when boarding your shuttle.'}
                </span>
              </div>
            </div>

            {/* Badges de Pago */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {/* Visa */}
              <div 
                className="bg-white rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm border border-slate-700/60 h-8 hover:scale-105 transition-transform duration-200" 
                title="Visa"
              >
                <svg viewBox="0 0 36 12" className="h-3.5 w-auto" fill="none">
                  <path d="M14.5 0.5L9.6 11.5H6.4L3.8 2.5C3.6 1.9 3.5 1.7 3 1.4C2.3 1 1.1 0.7 0 0.5L0.1 0.2H5.2C5.9 0.2 6.5 0.6 6.6 1.4L7.9 8L11.1 0.5H14.5ZM27.2 7.8C27.2 4.8 23.1 4.7 23.1 3.4C23.1 2.9 23.5 2.4 24.4 2.3C24.9 2.2 26.1 2.2 27.3 2.8L27.8 0.4C27.1 0.1 26.1 0 24.9 0C21.9 0 19.8 1.6 19.8 3.9C19.8 5.6 21.3 6.5 22.4 7.1C23.6 7.7 24 8.1 24 8.5C24 9.3 23.1 9.6 22.3 9.6C20.7 9.6 19.8 9.3 18.6 8.8L18.1 11.2C19 11.6 20.7 11.9 22.4 11.9C25.6 11.9 27.2 10.2 27.2 7.8ZM35.3 11.5H38.2L35.6 0.2H33C32.4 0.2 31.9 0.5 31.7 1.1L27.1 11.5H30.4L31.1 9.6H35.1L35.3 11.5ZM32 7.3L33.7 2.9L34.7 7.3H32ZM19.1 0.2L16.5 11.5H13.4L16 0.2H19.1Z" fill="#1434CB"/>
                </svg>
              </div>

              {/* Mastercard */}
              <div 
                className="bg-white rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm border border-slate-700/60 h-8 hover:scale-105 transition-transform duration-200" 
                title="Mastercard"
              >
                <svg viewBox="0 0 32 20" className="h-4 w-auto">
                  <circle cx="10" cy="10" r="9" fill="#EB001B" />
                  <circle cx="22" cy="10" r="9" fill="#F79E1B" fillOpacity="0.9" />
                </svg>
              </div>

              {/* American Express */}
              <div 
                className="bg-[#016FD0] rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm h-8 hover:scale-105 transition-transform duration-200 text-white font-black text-[10px] tracking-wider" 
                title="American Express"
              >
                AMEX
              </div>

              {/* Wompi El Salvador */}
              <div 
                className="bg-[#6320EE] hover:bg-[#5218cc] rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm h-8 hover:scale-105 transition-transform duration-200 text-white font-black text-xs tracking-wide gap-1" 
                title="Wompi El Salvador"
              >
                <span className="text-amber-300 font-black text-xs leading-none">✦</span>
                <span className="leading-none">wompi</span>
              </div>

              {/* PayPal */}
              <div 
                className="bg-white rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm border border-slate-700/60 h-8 hover:scale-105 transition-transform duration-200 gap-1" 
                title="PayPal"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-auto" fill="none">
                  <path d="M7 21h-4l2.5-16h6c3 0 5 1.5 4.7 4.5-.4 3.3-2.7 5.1-5.4 5.1H8.5L7 21z" fill="#003087"/>
                  <path d="M9 13.5h2.5c2.7 0 5-1.8 5.4-5.1.4-3-1.6-4.5-4.7-4.5H6.2L4 19h3.8l1.2-5.5z" fill="#0079C1"/>
                </svg>
                <span className="text-[#003087] font-extrabold text-[11px] tracking-tight">Pay<span className="text-[#0079C1]">Pal</span></span>
              </div>

              {/* Pago al Abordar */}
              <div 
                className="bg-emerald-950/90 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm h-8 hover:scale-105 transition-transform duration-200 text-emerald-300 text-xs font-semibold gap-1.5" 
                title="Pago en Efectivo o Transferencia al momento de viajar"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'es' ? 'Pago al Abordar' : 'Pay on Arrival'}</span>
              </div>

              {/* SSL 256-bit Seguro */}
              <div 
                className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 flex items-center justify-center shadow-sm h-8 text-slate-300 text-[11px] font-medium gap-1.5" 
                title="Conexión Segura con Cifrado SSL Bancario de 256 bits"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Trail Explorer. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};
