import { BotContext } from "../types/BotContext";
import { keyboard } from "../utils";
import { LANG_BTN, LANG_OPTIONS, setReturnContext, t } from "../lang";

// API imports
import userTelegramAPI from "../api/profileTelegramApi";
import taskTelegramAPI from "../api/taskTelegramApi";

// Task imports
import { showTasksMenu } from "./task/menu";
import { showTask } from "./task/task";
import { showEditTaskMenu } from "./task/edit";
import { showDeleteTaskMenu } from "./task/delete";
import { showSortTasksMenu } from "./task/sort";

// Category imports
import { showCategoriesMenu } from "./category/menu";
import { showCategory } from "./category/category";
import { showLinkedTasksMenu } from "./category/tasks";

// Profile import
import { showProfileMenu } from "./profile/menu";
import { showEditProfileMenu } from "./profile/edit";
import { showDeleteProfileMenu } from "./profile/delete";

// FAQ import
import { showFAQMenu } from "./faq/question";

// Menu creation utility
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

// Menus definition
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

// Messages map for localization
export const messagesMap = LANG_OPTIONS.reduce((acc, lang) => {
  Object.entries(lang.messages).forEach(([key, val]) => {
    (acc[key] ||= []).push(val);
  });
  return acc;
}, {} as Record<string, string[]>);

// Routes for menu actions
export const menuRoutes: [
  keyof typeof messagesMap,
  (ctx: BotContext) => Promise<void>
][] = [
  ["tasks", (ctx) => showTasksMenu(ctx, 0)],
  ["categories", (ctx) => showCategoriesMenu(ctx, 0)],
  ["profile", showProfileMenu],
  ["faq", showFAQMenu],
  ["showQuestions", showFAQMenu],

  ["editProfile", showEditProfileMenu],
  ["deleteProfile", showDeleteProfileMenu],
  [
    "yesDeleteProfile",
    async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const result = await userTelegramAPI.deleteAccount(ctx);
      if (result.status === "error") {
        await ctx.reply(t(userId, "deleteProfileFail"));
        return;
      }

      await ctx.reply(t(userId, "deleteProfileSuccess"));
      ctx.session = {
        categories: [],
        totalCategoryPages: 0,
        categoryPage: 0,
        activeCategoryIndex: 0,
        tasks: [],
        totalTaskPages: 0,
        taskPage: 0,
        step: null,
        token: undefined,
        user: undefined,
        activeTaskIndex: 0,
      };
      await menus.showAuthOptions(ctx);
    },
  ],
  ["noDeleteProfile", showProfileMenu],

  // Navigation
  ["backToMainMenu", menus.showMainMenu],
  ["backToTasks", (ctx) => showTasksMenu(ctx, 0)],
  [
    "backToTask",
    async (ctx) => {
      const index = ctx.session.activeTaskIndex ?? 0;
      await showTask(ctx, index);
    },
  ],
  ["backToCategories", (ctx) => showCategoriesMenu(ctx, 0)],
  [
    "backToCategory",
    (ctx) => showCategory(ctx, ctx.session.activeCategoryIndex ?? 0),
  ],

  // Tasks
  ["editTask", showEditTaskMenu],
  ["deleteTask", showDeleteTaskMenu],
  [
    "yesDeleteTask",
    async (ctx) => {
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
    },
  ],
  [
    "noDeleteTask",
    async (ctx) => {
      const index = ctx.session.activeTaskIndex ?? 0;
      await ctx.reply(t(ctx.from!.id, "deleteTaskCancel"));
      await showTask(ctx, index);
    },
  ],
  ["sortTasks", showSortTasksMenu],

  // Categories
  ["showLinkedTask", (ctx) => showLinkedTasksMenu(ctx, 0)],

  // Pagination
  [
    "next",
    async (ctx) => {
      if (ctx.session.step === "task") {
        const total = ctx.session.totalTaskPages || 1;
        ctx.session.taskPage = (ctx.session.taskPage + 1) % total;
        return showTasksMenu(ctx, ctx.session.taskPage);
      }

      if (ctx.session.step === "category") {
        const total = ctx.session.totalCategoryPages || 1;
        ctx.session.categoryPage =
          ((ctx.session.categoryPage ?? 0) + 1) % total;
        return showCategoriesMenu(ctx, ctx.session.categoryPage);
      }
    },
  ],
  [
    "prev",
    async (ctx) => {
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
    },
  ],
];
