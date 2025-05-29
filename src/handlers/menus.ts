import { BotContext } from "../types/BotContext";

import { keyboard } from "../utils";
import { LANG_BTN, LANG_OPTIONS, setReturnContext, t } from "../lang";

import taskTelegramAPI from "../api/taskTelegramApi";
import { showTasksMenu } from "./task/menu";
import { showTask } from "./task/task";
import { showCreateTaskMenu } from "./task/create";
import { showDeleteTaskMenu } from "./task/delete";

import { showCategoriesMenu } from "./category/menu";
import { showCreateCategoryMenu } from "./category/create";

import { showProfileMenu } from "./profile/menu";
import { showDeleteProfileMenu } from "./profile/delete";

import { showFAQMenu } from "./faq/question";

const createMenu =
  (
    messageKey: keyof (typeof LANG_OPTIONS)[0]["messages"],
    buttonRows: (ctx: BotContext, userId: number) => string[][]
  ): ((ctx: BotContext) => Promise<void>) =>
  async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    setReturnContext(userId, createMenu(messageKey, buttonRows));
    await ctx.reply(t(userId, messageKey), keyboard(buttonRows(ctx, userId)));
  };

export const menus = {
  showAuthOptions: createMenu("chooseAuth", (ctx, userId) => [
    [t(userId, "signIn"), t(userId, "signUp")],
    [LANG_BTN],
  ]),
  showMainMenu: createMenu("mainMenuMessage", (ctx, userId) => [
    [t(userId, "tasks"), t(userId, "categories")],
    [t(userId, "profile"), t(userId, "faq")],
    [t(userId, "logout"), LANG_BTN],
  ]),
};

export const messagesMap = LANG_OPTIONS.reduce((acc, lang) => {
  Object.entries(lang.messages).forEach(([key, val]) => {
    (acc[key] ||= []).push(val);
  });
  return acc;
}, {} as Record<string, string[]>);

export const menuRoutes: [
  keyof typeof messagesMap,
  (ctx: BotContext) => Promise<void>
][] = [
  ["tasks", (ctx) => showTasksMenu(ctx, 0)],
  ["categories", showCategoriesMenu],
  ["profile", showProfileMenu],
  ["deleteProfile", showDeleteProfileMenu],
  ["yesDeleteProfile", menus.showAuthOptions],
  ["noDeleteProfile", showProfileMenu],
  ["faq", showFAQMenu],
  ["backToMainMenu", menus.showMainMenu],
  ["createTask", showCreateTaskMenu],
  ["createCategory", showCreateCategoryMenu],
  ["backToTasks", (ctx) => showTasksMenu(ctx, 0)],
  ["backToCategories", showCategoriesMenu],
  ["showQuestions", showFAQMenu],
  ["deleteTask", showDeleteTaskMenu],
  ["yesDeleteTask", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
  
    const taskIndex = ctx.session.activeTaskIndex ?? 0;
    const task = ctx.session.tasks?.[taskIndex];
  
    if (!task) {
      await ctx.reply(t(userId, "taskNotFound"));
      return;
    }
  
    const result = await taskTelegramAPI.deleteTask(ctx, task._id);
    if (result.status === "error") {
      await ctx.reply(t(userId, "deleteTaskFail"));
    } else {
      await ctx.reply(t(userId, "deleteTaskSuccess"));
    }
  
    await showTasksMenu(ctx, ctx.session.taskPage || 0);
  }],
  ["noDeleteTask", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
  
    const index = ctx.session.activeTaskIndex ?? 0;
    await ctx.reply(t(userId, "deleteTaskCancel"));
    await showTask(ctx, index);
  }],
];
