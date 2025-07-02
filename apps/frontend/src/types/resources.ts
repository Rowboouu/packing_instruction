import enTranslation from '../../public/locales/en/translation.json';

const resources = {
  translation: enTranslation,
} as const;

type NestedTranslationKeys<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends string
        ? `${Extract<K, string>}`
        : T[K] extends Record<string, any>
          ? `${Extract<K, string>}.${NestedTranslationKeys<T[K]>}`
          : never;
    }[keyof T]
  : '';

export type TranslationKeys =
  | TemplateStringsArray
  | NestedTranslationKeys<typeof resources.translation>;

export default resources;
