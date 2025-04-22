import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import {
  t,
  LANG_OPTIONS,
  LABEL_TO_LANG,
  setUserLang,
} from './lang';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

const GLOBAL_LANG_BUTTON = '🌐 Language / Мова';
const RETURN_CONTEXT = new Map<number, () => Promise<void>>(); // call stack per user

const showLanguageSelection = async (
  ctx: any,
  returnTo?: () => Promise<void>,
  isFirstTime = false
) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (returnTo) RETURN_CONTEXT.set(userId, returnTo);

  const message = LANG_OPTIONS
    .map(lang =>
      isFirstTime
        ? lang.messages.firstTimeStartMessage
        : lang.messages.languageChoicePrompt
    )
    .join('\n');

  const buttons = LANG_OPTIONS.map(lang => [lang.label]);

  await ctx.reply(message, Markup.keyboard([...buttons]).oneTime().resize());
};

const showAuthOptions = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  await ctx.reply(
    t(userId, 'chooseAuth'),
    Markup.keyboard([
      [t(userId, 'signIn'), t(userId, 'signUp')],
      [GLOBAL_LANG_BUTTON],
    ])
      .oneTime()
      .resize()
  );
};

bot.start(async (ctx) => {
  await showLanguageSelection(ctx, async () => await showAuthOptions(ctx), true);
});

bot.hears(Object.keys(LABEL_TO_LANG), async (ctx) => {
  const userId = ctx.from?.id;
  const label = ctx.message.text;
  const lang = LABEL_TO_LANG[label];
  if (!userId || !lang) return;

  setUserLang(userId, lang);

  await ctx.reply(t(userId, 'confirmLanguage'), Markup.removeKeyboard());

  const returnTo = RETURN_CONTEXT.get(userId);
  if (returnTo) {
    await returnTo();
    RETURN_CONTEXT.delete(userId);
  } else {
    await showAuthOptions(ctx);
  }
});

bot.hears(GLOBAL_LANG_BUTTON, async (ctx) => {
  await showLanguageSelection(ctx, async () => await showAuthOptions(ctx));
});

bot.launch();
