import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN!);
const userLanguages = new Map<number, 'en' | 'uk'>();

const languages = {
  '🇬🇧 English': { code: 'en', message: 'Language was chosen 🇬🇧 English' },
  '🇺🇦 Українська': { code: 'uk', message: 'Мову обрано 🇺🇦 Українська' }
} as const;

bot.start((ctx) => {
  ctx.reply(
    '🇬🇧 Hello! Please choose language\n🇺🇦 Привіт! Будь ласка, оберіть мову',
    Markup.keyboard([Object.keys(languages)]).oneTime().resize()
  );
});

bot.hears(Object.keys(languages), (ctx) => {
  const userId = ctx.from?.id;
  const choice = ctx.message.text as keyof typeof languages;

  if (!userId) return;

  const selectedLang = languages[choice];
  userLanguages.set(userId, selectedLang.code);
  ctx.reply(selectedLang.message, Markup.removeKeyboard());
});

bot.launch();
