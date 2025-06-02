import { Telegraf } from "telegraf";

import { BotContext } from "../types/BotContext";
import { withUser } from "../utils";
import { LANG_OPTIONS, t } from "../lang";
import { menus } from "../handlers/menus";

// API imports
import profileAPI from "../api/profileAPI";
import taskAPI from "../api/taskAPI";

// Task imports
import { showTasksMenu } from "../handlers/task/menu";
import { showTask } from "../handlers/task/task";
import { showEditTaskMenu } from "../handlers/task/edit";
import {
  handleNoDeleteTask,
  handleYesDeleteTask,
  showDeleteTaskMenu,
} from "../handlers/task/delete";
import { showSortTasksMenu } from "../handlers/task/sort";
import { startCreateTask } from "../handlers/task/create";

// Task edit imports
import { handleEditTaskTitle } from "../handlers/task/edit/title";
import { handleEditTaskDescription } from "../handlers/task/edit/description";
import { handleEditTaskDeadline } from "../handlers/task/edit/deadline";
import { handleToggleTaskStatus } from "../handlers/task/edit/status";
import { startEditTaskCategories } from "../handlers/task/edit/categories";
import { handleEditTaskLinks } from "../handlers/task/edit/links";

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

export function setupMenuRoutes(bot: Telegraf<BotContext>) {
  const hears = (
    keys: string[],
    handler: (ctx: BotContext) => Promise<void>
  ) => {
    bot.hears(keys, async (ctx) => {
      const currentText = ctx.message?.text;

      const alwaysAllowed = ["LANG_BTN", "logout", "signIn", "signUp"];
      const isSafe = alwaysAllowed.some((key) =>
        messagesMap[key]?.includes(currentText || "")
      );

      if (!isSafe && !ctx.session.token) return;

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

      const result = await profileAPI.deleteAccount(ctx);
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
  ["createTask", startCreateTask],

  ["editTask", showEditTaskMenu],
  ["editTaskTitle", handleEditTaskTitle],
  ["editTaskDescription", handleEditTaskDescription],
  ["editTaskDeadline", handleEditTaskDeadline],
  ["toggleTaskStatus", handleToggleTaskStatus],
  ["editTaskCategories", startEditTaskCategories],
  ["editTaskLinks", handleEditTaskLinks],

  ["deleteTask", showDeleteTaskMenu],
  ["yesDeleteTask", handleYesDeleteTask],
  ["noDeleteTask", handleNoDeleteTask],
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
