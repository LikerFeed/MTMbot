import { Telegraf, Markup, Context } from 'telegraf';
import dotenv from 'dotenv';
import {
  t,
  LANG_OPTIONS,
  LABEL_TO_LANG,
  setUserLang,
  setReturnContext,
  getReturnContext,
  clearReturnContext,
} from './lang';
import { showTasksMenu } from './handlers/task/menu';
import { showCreateTaskMenu } from './handlers/task/create';
import { showCategoriesMenu } from './handlers/category/menu';
import { showCreateCategoryMenu } from './handlers/category/create';
import { showFAQMenu } from './handlers/faq/question';
import { handleFAQAnswer } from './handlers/faq/answer';
import { showProfileMenu } from './handlers/profile/menu';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

export const LANG_BTN = '🌐 Language / Мова';
const FAQ_NUMBERS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
const FAQ_BUTTON_ROWS = Array.from({ length: 2 }, (_, i) => FAQ_NUMBERS.slice(i * 5, i * 5 + 5));

export const keyboard = (buttons: string[][], opts: { oneTime?: boolean } = {}) =>
  Markup.keyboard(buttons).resize().oneTime(opts.oneTime ?? true);

const getUserId = (ctx: Context) => ctx.from?.id ?? -1;
const isValidUser = (id: number) => id > 0;

const withUser = async (ctx: Context, fn: (userId: number) => Promise<void>) => {
  const userId = getUserId(ctx);
  if (isValidUser(userId)) await fn(userId);
};

const createMenu = (
  messageKey: keyof typeof LANG_OPTIONS[0]['messages'],
  buttonRows: (ctx: Context, userId: number) => string[][]
): ((ctx: Context) => Promise<void>) =>
  async ctx => withUser(ctx, async userId => {
    setReturnContext(userId, createMenu(messageKey, buttonRows));
    await ctx.reply(t(userId, messageKey), keyboard(buttonRows(ctx, userId)));
  });

const showLanguageSelection = async (ctx: Context, returnTo?: (ctx: Context) => Promise<void>, isFirst = false) =>
  withUser(ctx, async userId => {
    if (returnTo) setReturnContext(userId, returnTo);
    const msg = LANG_OPTIONS.map(lang => isFirst ? lang.messages.firstTimeStartMessage : lang.messages.languageChoicePrompt).join('\n');
    const buttons = LANG_OPTIONS.map(lang => [lang.label]);
    await ctx.reply(msg, keyboard(buttons));
  });

const menus = {
  showAuthOptions: createMenu('chooseAuth', (ctx, userId) => [[t(userId, 'signIn'), t(userId, 'signUp')], [LANG_BTN]]),
  showMainMenu: createMenu('mainMenuMessage', (ctx, userId) => [
    [t(userId, 'tasks'), t(userId, 'categories')],
    [t(userId, 'profile'), t(userId, 'faq')],
    [t(userId, 'logout'), LANG_BTN],
  ]),
};

bot.start(async ctx => {
  const userId = getUserId(ctx);
  if (isValidUser(userId)) clearReturnContext(userId);
  await showLanguageSelection(ctx, undefined, true);
});

bot.hears(Object.keys(LABEL_TO_LANG), async ctx =>
  withUser(ctx, async userId => {
    const lang = LABEL_TO_LANG[ctx.message.text];
    if (!lang) return;
    setUserLang(userId, lang);
    await ctx.reply(t(userId, 'confirmLanguage'), Markup.removeKeyboard());
    const returnTo = getReturnContext(userId);
    returnTo ? await returnTo(ctx) : await menus.showAuthOptions(ctx);
  })
);

bot.hears(LANG_BTN, async ctx =>
  withUser(ctx, async userId => {
    const returnTo = getReturnContext(userId);
    await showLanguageSelection(ctx, returnTo ? ctx => returnTo(ctx) : menus.showAuthOptions);
  })
);

const hears = (triggers: string[], handler: (ctx: Context) => Promise<void>) => bot.hears(triggers, handler);

const messagesMap = LANG_OPTIONS.reduce((acc, lang) => {
  Object.entries(lang.messages).forEach(([k, v]) => (acc[k] ||= []).push(v));
  return acc;
}, {} as Record<string, string[]>);

hears([...messagesMap['signIn'], ...messagesMap['signUp']], menus.showMainMenu);

hears(messagesMap['logout'], async ctx =>
  withUser(ctx, async userId => {
    clearReturnContext(userId);
    await ctx.reply(t(userId, 'successLogout'), Markup.removeKeyboard());
    await menus.showAuthOptions(ctx);
  })
);

const menuRoutes: [keyof typeof messagesMap, (ctx: Context) => Promise<void>][] = [
  ['tasks', showTasksMenu],
  ['categories', showCategoriesMenu],
  ['profile', showProfileMenu],
  ['faq', showFAQMenu],
  ['backToMainMenu', menus.showMainMenu],
  ['createTask', showCreateTaskMenu],
  ['createCategory', showCreateCategoryMenu],
  ['backToTasks', showTasksMenu],
  ['backToCategories', showCategoriesMenu],
  ['showQuestions', showFAQMenu],
];

menuRoutes.forEach(([key, handler]) => hears(messagesMap[key], handler));

hears(FAQ_NUMBERS, handleFAQAnswer);

bot.launch();
