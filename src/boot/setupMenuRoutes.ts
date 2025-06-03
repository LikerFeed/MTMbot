import { Telegraf } from "telegraf";

import { BotContext } from "../types/BotContext";
import { withUser } from "../utils";
import { LANG_OPTIONS, t } from "../lang";
import { menus } from "../handlers/menus";

// Task imports
import { showTasksMenu } from "../handlers/task/menu";
import { showTask } from "../handlers/task/task";
import { showEditTaskMenu } from "../handlers/task/edit";
import {
  showDeleteTaskMenu,
  handleYesDeleteTask,
  handleNoDeleteTask,
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
import { startCreateCategory } from "../handlers/category/create";
import { handleEditCategoryTitle } from "../handlers/category/edit";
import { showLinkedTasksMenu } from "../handlers/category/tasks";
import {
  showDeleteCategoryMenu,
  handleYesDeleteCategory,
  handleNoDeleteCategory,
} from "../handlers/category/delete";

// Profile import
import { showProfileMenu } from "../handlers/profile/menu";
import { showEditProfileMenu } from "../handlers/profile/edit";
import { handleEditUsername } from "../handlers/profile/edit/username";
import { handleEditPassword } from "../handlers/profile/edit/password";
import {
  showDeleteProfileMenu,
  handleDeleteProfileConfirm,
} from "../handlers/profile/delete";

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

  ["backToProfile", showProfileMenu],
  ["editProfile", showEditProfileMenu],
  ["editUsername", handleEditUsername],
  ["editPassword", handleEditPassword],
  ["deleteProfile", showDeleteProfileMenu],
  ["yesDeleteProfile", handleDeleteProfileConfirm],
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
  ["createCategory", (ctx) => startCreateCategory(ctx)],
  ["editCategory", handleEditCategoryTitle],
  ["showLinkedTask", (ctx) => showLinkedTasksMenu(ctx, 0)],
  ["deleteCategory", showDeleteCategoryMenu],
  ["yesDeleteCategory", handleYesDeleteCategory],
  ["noDeleteCategory", handleNoDeleteCategory],

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
