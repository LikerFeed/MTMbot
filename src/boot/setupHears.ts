import { Telegraf, Markup } from "telegraf";
import { BotContext } from "../types/BotContext";

import { getUserId, isValidUser, withUser } from "../utils";
import { menus, messagesMap, menuRoutes } from "../handlers/menus";
import {
  t,
  LANG_BTN,
  LABEL_TO_LANG,
  setUserLang,
  getReturnContext,
  clearReturnContext,
  showLanguageSelection,
} from "../lang";

import { startSignIn } from "../handlers/auth/signIn/signIn";
import { startSignUp } from "../handlers/auth/signUp/signUp";
import { showTasksMenu } from "../handlers/task/menu";
import { showCategoriesMenu } from "../handlers/category/menu";

export function setupHeards(bot: Telegraf<BotContext>) {
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

  const hears = (
    triggers: string[],
    handler: (ctx: BotContext) => Promise<void>
  ) => bot.hears(triggers, handler);

  // Auth
  hears(messagesMap["signIn"], startSignIn);
  hears(messagesMap["signUp"], startSignUp);

  // Pagination
  hears(messagesMap["next"], async (ctx) => {
    if (ctx.session.step === "task") {
      const total = ctx.session.totalTaskPages || 1;
      ctx.session.taskPage = (ctx.session.taskPage + 1) % total;
      return showTasksMenu(ctx, ctx.session.taskPage);
    }

    if (ctx.session.step === "category") {
      const total = ctx.session.totalCategoryPages || 1;
      ctx.session.categoryPage = ((ctx.session.categoryPage ?? 0) + 1) % total;
      return showCategoriesMenu(ctx, ctx.session.categoryPage);
    }
  });

  hears(messagesMap["prev"], async (ctx) => {
    if (ctx.session.step === "task") {
      const total = ctx.session.totalTaskPages || 1;
      ctx.session.taskPage = (ctx.session.taskPage - 1 + total) % total;
      return showTasksMenu(ctx, ctx.session.taskPage);
    }

    if (ctx.session.step === "category") {
      const total = ctx.session.totalCategoryPages || 1;
      ctx.session.categoryPage =
        ((ctx.session.categoryPage ?? 0) - 1 + total) % total;
      return showCategoriesMenu(ctx, ctx.session.categoryPage);
    }
  });

  // logout
  hears(messagesMap["logout"], async (ctx) =>
    withUser(ctx, async (userId) => {
      clearReturnContext(userId);
      await ctx.reply(t(userId, "successLogout"), Markup.removeKeyboard());
      await menus.showAuthOptions(ctx);
    })
  );

  // static menu routes
  menuRoutes.forEach(([key, handler]) => hears(messagesMap[key], handler));
}
