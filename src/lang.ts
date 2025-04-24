import { Context } from 'telegraf';
import en from './locales/en';
import uk from './locales/uk';

export type LanguageCode = 'en' | 'uk';

const userLanguages = new Map<number, LanguageCode>();
const returnContexts = new Map<number, (ctx: Context) => Promise<void>>();

const TRANSLATIONS = { en, uk } as const;

export const LANG_OPTIONS = Object.entries(TRANSLATIONS).map(([code, messages]) => ({
  code: code as LanguageCode,
  label: messages.languageButton,
  messages,
}));

export const LABEL_TO_LANG: Record<string, LanguageCode> = LANG_OPTIONS.reduce(
  (acc, lang) => {
    acc[lang.label] = lang.code;
    return acc;
  },
  {} as Record<string, LanguageCode>
);

export const getUserLang = (userId: number): LanguageCode =>
  userLanguages.get(userId) || 'en';

export const setUserLang = (userId: number, lang: LanguageCode): void => {
  userLanguages.set(userId, lang);
};

export const t = (userId: number, key: keyof typeof en): string => {
  const lang = getUserLang(userId);
  return TRANSLATIONS[lang][key];
};

export const setReturnContext = (
  userId: number,
  callback: (ctx: Context) => Promise<void>
): void => {
  returnContexts.set(userId, callback);
};

export const getReturnContext = (userId: number) =>
  returnContexts.get(userId);

export const clearReturnContext = (userId: number): void => {
  returnContexts.delete(userId);
};
