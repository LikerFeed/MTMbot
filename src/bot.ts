import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN!);
const userLanguages = new Map<number, 'en' | 'uk'>();

bot.start((ctx) => {
  ctx.reply(
    '🇬🇧 Please choose language\n🇺🇦 Будь ласка, оберіть мову',
    Markup.keyboard([
      ['🇬🇧 English', '🇺🇦 Українська']
    ])
    .oneTime()
    .resize()
  );
});

bot.hears('🇬🇧 English', (ctx) => {
  userLanguages.set(ctx.from!.id, 'en');
  ctx.reply('Language chosen 🇬🇧 English', Markup.removeKeyboard());
});

bot.hears('🇺🇦 Українська', (ctx) => {
  userLanguages.set(ctx.from!.id, 'uk');
  ctx.reply('Мову обрано 🇺🇦 Українська', Markup.removeKeyboard());
});

bot.launch();
