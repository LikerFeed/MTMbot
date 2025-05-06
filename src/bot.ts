import { Telegraf, Markup, Context } from "telegraf";
import dotenv from "dotenv";

import { getUserId, isValidUser, withUser } from "./utils";
import { menus, messagesMap, menuRoutes } from "./handlers/menus";
import {
  t,
  LANG_BTN,
  LABEL_TO_LANG,
  setUserLang,
  getReturnContext,
  clearReturnContext,
  showLanguageSelection,
} from "./lang";

import { handleSignIn, startSignIn } from "./handlers/auth/signIn/signIn";

import { FAQ_NUMBERS } from "./handlers/faq/question";
import { handleFAQAnswer } from "./handlers/faq/answer";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(async (ctx) => {
  const userId = getUserId(ctx);
  if (isValidUser(userId)) clearReturnContext(userId);
  await showLanguageSelection(ctx, undefined, true);
});

bot.hears(Object.keys(LABEL_TO_LANG), async (ctx) =>
  withUser(ctx, async (userId) => {
    const lang = LABEL_TO_LANG[ctx.message.text];
    if (!lang) return;
    setUserLang(userId, lang);
    await ctx.reply(t(userId, "confirmLanguage"), Markup.removeKeyboard());
    const returnTo = getReturnContext(userId);
    returnTo ? await returnTo(ctx) : await menus.showAuthOptions(ctx);
  })
);

bot.hears(LANG_BTN, async (ctx) =>
  withUser(ctx, async (userId) => {
    const returnTo = getReturnContext(userId);
    await showLanguageSelection(
      ctx,
      returnTo ? (ctx) => returnTo(ctx) : menus.showAuthOptions
    );
  })
);

const hears = (triggers: string[], handler: (ctx: Context) => Promise<void>) =>
  bot.hears(triggers, handler);

hears(messagesMap["signIn"], startSignIn);
hears(messagesMap["signUp"], menus.showMainMenu);

hears(messagesMap["logout"], async (ctx) =>
  withUser(ctx, async (userId) => {
    clearReturnContext(userId);
    await ctx.reply(t(userId, "successLogout"), Markup.removeKeyboard());
    await menus.showAuthOptions(ctx);
  })
);

menuRoutes.forEach(([key, handler]) => hears(messagesMap[key], handler));

hears(FAQ_NUMBERS, handleFAQAnswer);

bot.launch();

bot.on('text', handleSignIn);
