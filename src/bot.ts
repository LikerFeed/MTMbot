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

import { startSignIn, handleSignIn } from "./handlers/auth/signIn/signIn";
import { startSignUp, handleSignUp } from "./handlers/auth/signUp/signUp";

import { showTasksMenu } from "./handlers/task/menu";
import { showTask } from "./handlers/task/task";

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
hears(messagesMap["signUp"], startSignUp);

hears(messagesMap["next"], (ctx) => showTasksMenu(ctx, getPageOffset(ctx, +1)));
hears(messagesMap["prev"], (ctx) => showTasksMenu(ctx, getPageOffset(ctx, -1)));

const userPages = new Map<number, number>();

function getPageOffset(ctx: Context, offset: number): number {
  const userId = ctx.from?.id ?? -1;
  const current = userPages.get(userId) ?? 0;
  const next = current + offset;
  userPages.set(userId, next);
  return next;
}

const TASKS_COUNT = 14;
const TASK_NUMBER_STRINGS = Array.from(
  { length: TASKS_COUNT },
  (_, i) => `${i + 1}`
);

bot.hears(TASK_NUMBER_STRINGS, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.message || typeof ctx.message.text !== "string") return;

  const taskIndex = Number(ctx.message.text) - 1;
  if (isNaN(taskIndex)) return;

  await showTask(ctx, taskIndex);
});

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

bot.on("text", async (ctx) => {
  await handleSignIn(ctx);
  await handleSignUp(ctx);
});
