import { Telegraf, Markup } from "telegraf";
import { BotContext } from "../types/BotContext";

import { getUserId, isValidUser, withUser } from "../utils";
import {
  t,
  LANG_BTN,
  LABEL_TO_LANG,
  setUserLang,
  getReturnContext,
  clearReturnContext,
  showLanguageSelection,
} from "../lang";

import { messagesMap } from "./setupMenuRoutes";


import { menus } from "../handlers/menus";
import { startSignIn } from "../handlers/auth/signIn/signIn";
import { startSignUp } from "../handlers/auth/signUp/signUp";

export function setupHears(bot: Telegraf<BotContext>) {
  // /start
  bot.start(async (ctx) => {
    const userId = getUserId(ctx);
    if (isValidUser(userId)) clearReturnContext(userId);
    await showLanguageSelection(ctx, undefined, true);
  });

  // Lang
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

  const hears = (
    triggers: string[],
    handler: (ctx: BotContext) => Promise<void>
  ) => bot.hears(triggers, handler);

  // Auth
  hears(messagesMap["signIn"], startSignIn);
  hears(messagesMap["signUp"], startSignUp);

  // Logout
  hears(messagesMap["logout"], async (ctx) =>
    withUser(ctx, async (userId) => {
      clearReturnContext(userId);
      await ctx.reply(t(userId, "successLogout"), Markup.removeKeyboard());
      await menus.showAuthOptions(ctx);
    })
  );
}
