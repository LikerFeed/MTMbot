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

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

const LANG_BTN = '🌐 Language / Мова';
const FAQ_NUMBERS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
const FAQ_BUTTON_ROWS = [FAQ_NUMBERS.slice(0, 5), FAQ_NUMBERS.slice(5, 10)];

const keyboard = (buttons: string[][], opts: { oneTime?: boolean } = {}) =>
  Markup.keyboard(buttons)
    .resize()
    .oneTime(opts.oneTime ?? true);

const getUserId = (ctx: Context) => ctx.from?.id;

const withUser = async (ctx: Context, fn: (userId: number) => Promise<void>) => {
  const userId = getUserId(ctx);
  if (userId) await fn(userId);
};

const showLanguageSelection = async (
  ctx: Context,
  returnTo?: (ctx: Context) => Promise<void>,
  isFirst = false
) =>
  withUser(ctx, async userId => {
    if (returnTo) setReturnContext(userId, returnTo);
    const msg = LANG_OPTIONS
      .map(lang => isFirst ? lang.messages.firstTimeStartMessage : lang.messages.languageChoicePrompt)
      .join('\n');
    const buttons = LANG_OPTIONS.map(lang => [lang.label]);
    await ctx.reply(msg, keyboard(buttons));
  });

const showAuthOptions = async (ctx: Context) =>
  withUser(ctx, async userId => {
    if (!getReturnContext(userId)) setReturnContext(userId, async ctx => showAuthOptions(ctx));
    await ctx.reply(
      t(userId, 'chooseAuth'),
      keyboard([[t(userId, 'signIn'), t(userId, 'signUp')], [LANG_BTN]])
    );
  });

const showMainMenu = async (ctx: Context) =>
  withUser(ctx, async userId => {
    setReturnContext(userId, async ctx => showMainMenu(ctx));
    await ctx.reply(
      t(userId, 'mainMenuMessage'),
      keyboard([
        [t(userId, 'tasks'), t(userId, 'categories')],
        [t(userId, 'profile'), t(userId, 'faq')],
        [t(userId, 'logout'), LANG_BTN],
      ])
    );
  });

const showSubMenu = (
  msgKey: keyof typeof LANG_OPTIONS[0]['messages'],
  backKey: keyof typeof LANG_OPTIONS[0]['messages']
) => async (ctx: Context) =>
  withUser(ctx, async userId => {
    setReturnContext(userId, async ctx => showSubMenu(msgKey, backKey)(ctx));
    await ctx.reply(t(userId, msgKey), keyboard([[t(userId, backKey)], [LANG_BTN]]));
  });

const showTasksMenu = async (ctx: Context) =>
  withUser(ctx, async userId => {
    setReturnContext(userId, async ctx => showTasksMenu(ctx));
    await ctx.reply(
      t(userId, 'tasksMenu'),
      keyboard([[t(userId, 'createTask')], [t(userId, 'backToMainMenu'), LANG_BTN]])
    );
  });

const showCategoriesMenu = async (ctx: Context) =>
  withUser(ctx, async userId => {
    setReturnContext(userId, async ctx => showCategoriesMenu(ctx));
    await ctx.reply(
      t(userId, 'categoriesMenu'),
      keyboard([[t(userId, 'createCategory')], [t(userId, 'backToMainMenu'), LANG_BTN]])
    );
  });

const showProfileMenu = showSubMenu('profileMenu', 'backToMainMenu');
const showCreateTaskMenu = showSubMenu('createTask', 'backToTasks');
const showCreateCategoryMenu = showSubMenu('createCategory', 'backToCategories');

const showFAQMenu = async (ctx: Context) =>
  withUser(ctx, async userId => {
    setReturnContext(userId, async ctx => showFAQMenu(ctx));
    const questions = FAQ_NUMBERS.map(
      n => `${n}. ${t(userId, `question${n}` as keyof typeof LANG_OPTIONS[0]['messages'])}`
    );
    const msg = `${t(userId, 'chooseQuestion')}\n\n${questions.join('\n')}`;
    await ctx.reply(
      msg,
      keyboard([
        [t(userId, 'showQuestions')],
        ...FAQ_BUTTON_ROWS,
        [t(userId, 'backToMainMenu')],
        [LANG_BTN],
      ])
    );
  });

bot.start(async ctx => {
  const userId = getUserId(ctx);
  if (userId) clearReturnContext(userId);
  await showLanguageSelection(ctx, undefined, true);
});

bot.hears(Object.keys(LABEL_TO_LANG), async ctx =>
  withUser(ctx, async userId => {
    const label = ctx.message.text;
    const lang = LABEL_TO_LANG[label];
    if (!lang) return;
    setUserLang(userId, lang);
    await ctx.reply(t(userId, 'confirmLanguage'), Markup.removeKeyboard());
    const returnTo = getReturnContext(userId);
    returnTo ? await returnTo(ctx) : await showAuthOptions(ctx);
  })
);

bot.hears(LANG_BTN, async ctx =>
  withUser(ctx, async userId => {
    const returnTo = getReturnContext(userId);
    await showLanguageSelection(ctx, returnTo ? ctx => returnTo(ctx) : showAuthOptions);
  })
);

const hears = (phrases: string[], handler: (ctx: Context) => Promise<void>) =>
  bot.hears(phrases, handler);

const messagesMap = LANG_OPTIONS.reduce((acc, lang) => {
  Object.entries(lang.messages).forEach(([key, val]) => {
    (acc[key] ||= []).push(val);
  });
  return acc;
}, {} as Record<string, string[]>);

hears([...messagesMap['signIn'], ...messagesMap['signUp']], showMainMenu);

hears(messagesMap['logout'], async ctx =>
  withUser(ctx, async userId => {
    clearReturnContext(userId);
    await ctx.reply(t(userId, 'successLogout'), Markup.removeKeyboard());
    await showAuthOptions(ctx);
  })
);

const menuRoutes: [keyof typeof messagesMap, (ctx: Context) => Promise<void>][] = [
  ['tasks', showTasksMenu],
  ['categories', showCategoriesMenu],
  ['profile', showProfileMenu],
  ['faq', showFAQMenu],
  ['backToMainMenu', showMainMenu],
  ['createTask', showCreateTaskMenu],
  ['createCategory', showCreateCategoryMenu],
  ['backToTasks', showTasksMenu],
  ['backToCategories', showCategoriesMenu],
  ['showQuestions', showFAQMenu],
];

menuRoutes.forEach(([key, handler]) => hears(messagesMap[key], handler));

hears(FAQ_NUMBERS, async ctx =>
  withUser(ctx, async userId => {
    if (!ctx.message || !('text' in ctx.message)) return;
    const number = ctx.message.text;
    const question = t(userId, `question${number}` as keyof typeof LANG_OPTIONS[0]['messages']);
    const answer = t(userId, `answer${number}` as keyof typeof LANG_OPTIONS[0]['messages']);
    const followup = t(userId, 'chooseAnotherQuestion');
    await ctx.reply(`${number}. ${question}\n\n${answer}\n\n${followup}`);
  })
);

bot.launch();
