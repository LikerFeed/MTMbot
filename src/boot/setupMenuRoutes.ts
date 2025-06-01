import { Telegraf } from "telegraf";

import { BotContext } from "../types/BotContext";
import { withUser } from "../utils";
import { LANG_OPTIONS, t } from "../lang";
import { menus } from "../handlers/menus";

// API imports
import userTelegramAPI from "../api/profileTelegramApi";
import taskTelegramAPI from "../api/taskTelegramApi";

// Task imports
import { showTasksMenu } from "../handlers/task/menu";
import { showTask } from "../handlers/task/task";
import { showEditTaskMenu } from "../handlers/task/edit";
import { showDeleteTaskMenu } from "../handlers/task/delete";
import { showSortTasksMenu } from "../handlers/task/sort";

// Category imports
import { showCategoriesMenu } from "../handlers/category/menu";
import { showCategory } from "../handlers/category/category";
import { showLinkedTasksMenu } from "../handlers/category/tasks";

// Profile import
import { showProfileMenu } from "../handlers/profile/menu";
import { showEditProfileMenu } from "../handlers/profile/edit";
import { showDeleteProfileMenu } from "../handlers/profile/delete";

// FAQ import
import { showFAQMenu } from "../handlers/faq/question";

const textAllowedSteps = ["LANG_BTN", "logout", "signIn", "signUp"];

export function setupMenuRoutes(bot: Telegraf<BotContext>) {
  const hears = (keys: string[], handler: (ctx: BotContext) => Promise<void>) => {
    bot.hears(keys, async (ctx) => {
      const currentText = ctx.message?.text;

      const isAllowed = textAllowedSteps.some((key) => messagesMap[key]?.includes(currentText || ""));
      if (!isAllowed) return;

      await withUser(ctx, async () => handler(ctx));
    });
  };

  menuRoutes.forEach(([key, handler]) => {
    const keys = messagesMap[key] || [];
    hears(keys, handler);
  });
}

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
