import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import {
  t,
  LANG_OPTIONS,
  LABEL_TO_LANG,
  getUserLang,
  setUserLang,
} from './lang';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

const showLanguageSelection = (ctx: any) => {
  const message = LANG_OPTIONS.map(lang => lang.messages.startMessage).join('\n');
  const buttons = LANG_OPTIONS.map(lang => lang.label);
  ctx.reply(message, Markup.keyboard([buttons]).oneTime().resize());
};

const showAuthOptions = (ctx: any, userId: number) => {
  ctx.reply(
    t(userId, 'chooseAuth'),
    Markup.keyboard([[t(userId, 'signIn'), t(userId, 'signUp')]])
      .oneTime()
      .resize()
  );
};

bot.start((ctx) => {
  showLanguageSelection(ctx);
});

bot.hears(Object.keys(LABEL_TO_LANG), async (ctx) => {
  const userId = ctx.from?.id;
  const label = ctx.message.text;
  const lang = LABEL_TO_LANG[label];
  if (!userId || !lang) return;

  setUserLang(userId, lang);

  await ctx.reply(t(userId, 'confirmLanguage'), Markup.removeKeyboard());
  await showAuthOptions(ctx, userId);
});

bot.launch();
