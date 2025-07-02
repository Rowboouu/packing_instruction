import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

const isDev = import.meta.env.DEV;

export const supportedLang = ['en', 'zh'] as const;

export type Language = (typeof supportedLang)[number];

i18next
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: 'en', // if you're using a language detector, do not define the lng option
    fallbackLng: 'en',
    supportedLngs: supportedLang,
    debug: isDev,
    interpolation: {
      escapeValue: false,
    },
  });

export { i18next };
