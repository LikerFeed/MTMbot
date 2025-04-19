import en from './locales/en';
import uk from './locales/uk';

export type LanguageCode = 'en' | 'uk';

const userLanguages = new Map<number, LanguageCode>();

const TRANSLATIONS = { en, uk } as const;

export const LANG_OPTIONS = Object.entries(TRANSLATIONS).map(([code, dict]) => ({
  code: code as LanguageCode,
  label: dict.languageButton,
  messages: dict,
}));

export const LABEL_TO_LANG: Record<string, LanguageCode> = LANG_OPTIONS.reduce((acc, lang) => {
  acc[lang.label] = lang.code;
  return acc;
}, {} as Record<string, LanguageCode>);

export const getUserLang = (userId: number): LanguageCode =>
  userLanguages.get(userId) || 'en';

export const setUserLang = (userId: number, lang: LanguageCode): void => {
  userLanguages.set(userId, lang);
};

export const t = (userId: number, key: keyof typeof en): string => {
  const lang = getUserLang(userId);
  return TRANSLATIONS[lang][key];
};
