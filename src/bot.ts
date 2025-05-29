import { Telegraf, Markup, session, Middleware } from "telegraf";
import { SessionData, BotContext } from "./types/BotContext";
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

import { startSignIn, handleSignIn } from "./handlers/auth/signIn/signIn";
import { startSignUp, handleSignUp } from "./handlers/auth/signUp/signUp";

import { showTasksMenu } from "./handlers/task/menu";
import { showTask } from "./handlers/task/task";

import { handleFAQAnswer } from "./handlers/faq/answer";

dotenv.config();
const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN!);
bot.use(
  session({
    defaultSession: (): SessionData => ({
      tasks: [],
      totalTaskPages: 0,
      taskPage: 0,
      step: null,
      token: undefined,
      user: undefined,
      activeTaskIndex: 0,
    }),
  }) as unknown as Middleware<BotContext>
);

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

const hears = (triggers: string[], handler: (ctx: BotContext) => Promise<void>) =>
  bot.hears(triggers, handler);

hears(messagesMap["signIn"], startSignIn);
hears(messagesMap["signUp"], startSignUp);

hears(messagesMap["next"], (ctx) => showTasksMenu(ctx, getPageOffset(ctx, +1)));
hears(messagesMap["prev"], (ctx) => showTasksMenu(ctx, getPageOffset(ctx, -1)));

const userPages = new Map<number, number>();

function getPageOffset(ctx: BotContext, offset: number): number {
  const userId = ctx.from?.id ?? -1;
  const current = userPages.get(userId) ?? 0;
  const next = current + offset;
  userPages.set(userId, next);
  return next;
}

hears(messagesMap["logout"], async (ctx) =>
  withUser(ctx, async (userId) => {
    clearReturnContext(userId);
    await ctx.reply(t(userId, "successLogout"), Markup.removeKeyboard());
    await menus.showAuthOptions(ctx);
  })
);

menuRoutes.forEach(([key, handler]) => hears(messagesMap[key], handler));

bot.launch();

bot.on("text", async (ctx) => {
  await handleSignIn(ctx);
  await handleSignUp(ctx);

  const userId = ctx.from?.id;
  const text = ctx.message?.text;

  if (!userId || !text) return;

  const isNumber = /^\d+$/.test(text);
  if (!isNumber) return;

  const index = Number(text) - 1;

  if (ctx.session.step === "faq") {
    await handleFAQAnswer(ctx);
    return;
  }

  if (ctx.session.step === "task") {
    await showTask(ctx, index);
    return;
  }
});
