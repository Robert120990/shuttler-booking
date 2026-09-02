import { useEffect } from 'react';
import { useLanguageStore } from '../../i18n';

export const LanguageSetter = () => {
  const { language } = useLanguageStore();

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return null;
};
