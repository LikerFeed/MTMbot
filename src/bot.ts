import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import {
  t,
  LANG_OPTIONS,
  LABEL_TO_LANG,
  setUserLang,
  setReturnContext,
  getReturnContext,
  clearReturnContext,
  getUserLang,
} from './lang';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);
const GLOBAL_LANG_BUTTON = '🌐 Language / Мова';

const showLanguageSelection = async (
  ctx: any,
  returnTo?: (ctx: any) => Promise<void>,
  isFirstTime = false
) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (returnTo) setReturnContext(userId, returnTo);

  const message = LANG_OPTIONS.map((lang) =>
    isFirstTime
      ? lang.messages.firstTimeStartMessage
      : lang.messages.languageChoicePrompt
  ).join('\n');

  const buttons = LANG_OPTIONS.map((lang) => [lang.label]);

  await ctx.reply(message, Markup.keyboard(buttons).oneTime().resize());
};

const showAuthOptions = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (!getReturnContext(userId)) {
    setReturnContext(userId, async (ctx) => await showAuthOptions(ctx));
  }

  await ctx.reply(
    t(userId, 'chooseAuth'),
    Markup.keyboard([
      [t(userId, 'signIn'), t(userId, 'signUp')],
      [GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

const showMainMenu = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, async (ctx) => await showMainMenu(ctx));

  await ctx.reply(
    t(userId, 'mainMenuMessage'),
    Markup.keyboard([
      [t(userId, 'logout')],
      [GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  if (userId) {
    clearReturnContext(userId);
  }

  await showLanguageSelection(ctx, undefined, true);
});

bot.hears(Object.keys(LABEL_TO_LANG), async (ctx) => {
  const userId = ctx.from?.id;
  const label = ctx.message.text;
  const lang = LABEL_TO_LANG[label];
  if (!userId || !lang) return;

  setUserLang(userId, lang);
  await ctx.reply(t(userId, 'confirmLanguage'), Markup.removeKeyboard());

  const returnTo = getReturnContext(userId);
  if (returnTo) {
    await returnTo(ctx);
  } else {
    await showAuthOptions(ctx);
  }
});

bot.hears(GLOBAL_LANG_BUTTON, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const returnTo = getReturnContext(userId);
  await showLanguageSelection(ctx, async (ctx) => {
    if (returnTo) {
      await returnTo(ctx);
    } else {
      await showAuthOptions(ctx);
    }
  });
});

const allAuthButtons = LANG_OPTIONS.flatMap((lang) => [
  lang.messages.signIn,
  lang.messages.signUp,
]);

bot.hears(allAuthButtons, async (ctx) => {
  await showMainMenu(ctx);
});

const allLogoutButtons = LANG_OPTIONS.map((lang) => lang.messages.logout);

bot.hears(allLogoutButtons, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  clearReturnContext(userId);
  await ctx.reply(t(userId, 'successLogout'), Markup.removeKeyboard());
  await showAuthOptions(ctx);
});

bot.launch();
