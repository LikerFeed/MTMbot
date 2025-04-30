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

  const message = LANG_OPTIONS.map(lang =>
    isFirstTime
      ? lang.messages.firstTimeStartMessage
      : lang.messages.languageChoicePrompt
  ).join('\n');

  const buttons = LANG_OPTIONS.map(lang => [lang.label]);

  await ctx.reply(message, Markup.keyboard(buttons).oneTime().resize());
};

const showAuthOptions = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (!getReturnContext(userId)) {
    setReturnContext(userId, async ctx => await showAuthOptions(ctx));
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

  setReturnContext(userId, async ctx => await showMainMenu(ctx));

  await ctx.reply(
    t(userId, 'mainMenuMessage'),
    Markup.keyboard([
      [t(userId, 'tasks'), t(userId, 'categories')],
      [t(userId, 'profile'), t(userId, 'faq')],
      [t(userId, 'logout'), GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

const showTasksMenu = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, async ctx => await showTasksMenu(ctx));

  await ctx.reply(
    t(userId, 'tasksMenu'),
    Markup.keyboard([
      [t(userId, 'createTask')],
      [t(userId, 'backToMainMenu'), GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

const showCategoriesMenu = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, async ctx => await showCategoriesMenu(ctx));

  await ctx.reply(
    t(userId, 'categoriesMenu'),
    Markup.keyboard([
      [t(userId, 'createCategory')],
      [t(userId, 'backToMainMenu'), GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

const showProfileMenu = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, async ctx => await showProfileMenu(ctx));

  await ctx.reply(
    '👤 Profile menu (stub)',
    Markup.keyboard([
      [t(userId, 'backToMainMenu')],
      [GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

const showFAQMenu = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, async ctx => await showFAQMenu(ctx));

  const questions = Array.from({ length: 10 }, (_, i) => t(userId, `question${i + 1}` as keyof typeof LANG_OPTIONS[0]['messages']));
  const message = `${t(userId, 'chooseQuestion')}\n\n` + questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

  await ctx.reply(
    message,
    Markup.keyboard([
      [t(userId, 'showQuestions')],
      ['1', '2', '3', '4', '5'],
      ['6', '7', '8', '9', '10'],
      [t(userId, 'backToMainMenu')],
      [GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

const showCreateTaskMenu = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, async ctx => await showCreateTaskMenu(ctx));

  await ctx.reply(
    t(userId, 'createTask'),
    Markup.keyboard([
      [t(userId, 'backToTasks')],
      [GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

const showCreateCategoryMenu = async (ctx: any) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, async ctx => await showCreateCategoryMenu(ctx));

  await ctx.reply(
    t(userId, 'createCategory'),
    Markup.keyboard([
      [t(userId, 'backToCategories')],
      [GLOBAL_LANG_BUTTON],
    ]).oneTime().resize()
  );
};

bot.start(async ctx => {
  const userId = ctx.from?.id;
  if (userId) clearReturnContext(userId);

  await showLanguageSelection(ctx, undefined, true);
});

bot.hears(Object.keys(LABEL_TO_LANG), async ctx => {
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

bot.hears(GLOBAL_LANG_BUTTON, async ctx => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const returnTo = getReturnContext(userId);
  await showLanguageSelection(ctx, async ctx => {
    if (returnTo) {
      await returnTo(ctx);
    } else {
      await showAuthOptions(ctx);
    }
  });
});

const allAuthButtons = LANG_OPTIONS.flatMap(lang => [
  lang.messages.signIn,
  lang.messages.signUp,
]);

const allLogoutButtons = LANG_OPTIONS.map(lang => lang.messages.logout);
const allTasksButtons = LANG_OPTIONS.map(lang => lang.messages.tasks);
const allCategoriesButtons = LANG_OPTIONS.map(lang => lang.messages.categories);
const allProfileButtons = LANG_OPTIONS.map(lang => lang.messages.profile);
const allFAQButtons = LANG_OPTIONS.map(lang => lang.messages.faq);
const allBackButtons = LANG_OPTIONS.map(lang => lang.messages.backToMainMenu);
const allCreateTaskButtons = LANG_OPTIONS.map(lang => lang.messages.createTask);
const allCreateCategoryButtons = LANG_OPTIONS.map(lang => lang.messages.createCategory);
const allBackToTasksButtons = LANG_OPTIONS.map(lang => lang.messages.backToTasks);
const allBackToCategoriesButtons = LANG_OPTIONS.map(lang => lang.messages.backToCategories);

bot.hears(allAuthButtons, async ctx => {
  await showMainMenu(ctx);
});

bot.hears(allLogoutButtons, async ctx => {
  const userId = ctx.from?.id;
  if (!userId) return;

  clearReturnContext(userId);
  await ctx.reply(t(userId, 'successLogout'), Markup.removeKeyboard());
  await showAuthOptions(ctx);
});

bot.hears(allTasksButtons, async ctx => {
  await showTasksMenu(ctx);
});

bot.hears(allCategoriesButtons, async ctx => {
  await showCategoriesMenu(ctx);
});

bot.hears(allProfileButtons, async ctx => {
  await showProfileMenu(ctx);
});

bot.hears(allFAQButtons, async ctx => {
  await showFAQMenu(ctx);
});

bot.hears(allBackButtons, async ctx => {
  await showMainMenu(ctx);
});

bot.hears(allCreateTaskButtons, async ctx => {
  await showCreateTaskMenu(ctx);
});

bot.hears(allCreateCategoryButtons, async ctx => {
  await showCreateCategoryMenu(ctx);
});

bot.hears(allBackToTasksButtons, async ctx => {
  await showTasksMenu(ctx);
});

bot.hears(allBackToCategoriesButtons, async ctx => {
  await showCategoriesMenu(ctx);
});

const allShowQuestionsButtons = LANG_OPTIONS.map(lang => lang.messages.showQuestions);

bot.hears(allShowQuestionsButtons, async ctx => {
  await showFAQMenu(ctx);
});

const allFaqNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

bot.hears(allFaqNumbers, async ctx => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const number = Number(ctx.message.text);
  const question = t(userId, `question${number}` as keyof typeof LANG_OPTIONS[0]['messages']);
  const answer = t(userId, `answer${number}` as keyof typeof LANG_OPTIONS[0]['messages']);
  const extraPrompt = t(userId, 'chooseAnotherQuestion');

  await ctx.reply(`${number}. ${question}\n\n${answer}\n\n${extraPrompt}`);
});

bot.launch();
