import { BotContext } from "../types/BotContext";
import { t } from "../lang";

// Auth
import { handleSignIn } from "../handlers/auth/signIn";
import { handleSignUp } from "../handlers/auth/signUp";

// Show
import { showTasksMenu, TASKS_PER_PAGE } from "../handlers/task/menu";
import { showTask } from "../handlers/task/task";
import { CATEGORIES_PER_PAGE } from "../handlers/category/menu";
import { showCategory } from "../handlers/category/category";

// Tasks
import { handleCreateTask } from "../handlers/task/create";

import { handleEditTaskTitleText } from "../handlers/task/edit/title";
import { handleEditTaskDescriptionText } from "../handlers/task/edit/description";
import { handleEditTaskDeadlineText } from "../handlers/task/edit/deadline";
import { handleEditTaskCategoriesText } from "../handlers/task/edit/categories";
import { handleEditTaskLinksText } from "../handlers/task/edit/links";

// Categories
import { handleCreateCategoryTitle } from "../handlers/category/create";
import { handleEditCategoryTitleText } from "../handlers/category/edit";

// Profile
import { handleEditUsernameText } from "../handlers/profile/edit/username";
import { handleEditPasswordText } from "../handlers/profile/edit/password";

// FAQ
import { handleFAQAnswer } from "../handlers/faq/answer";

export const setupTextSteps = async (ctx: BotContext) => {
  await handleSignIn(ctx);
  await handleSignUp(ctx);

  const userId = ctx.from?.id;
  if (!userId || !ctx.message || !("text" in ctx.message)) return;
  const text = ctx.message.text;

  const step = ctx.session.step;

  const stepHandlers: Partial<
    Record<string, (ctx: BotContext) => Promise<void>>
  > = {
    create_task: handleCreateTask,

    edit_task_title: handleEditTaskTitleText,
    edit_task_description: handleEditTaskDescriptionText,
    edit_task_deadline: handleEditTaskDeadlineText,
    edit_task_categories: handleEditTaskCategoriesText,
    edit_task_links: handleEditTaskLinksText,

    create_category_title: handleCreateCategoryTitle,
    edit_category_title: handleEditCategoryTitleText,

    edit_username: handleEditUsernameText,
    edit_password_old: handleEditPasswordText,
    edit_password_new: handleEditPasswordText,
  };

  if (step && step in stepHandlers) {
    return stepHandlers[step]?.(ctx);
  }

  // Sort tasks
  if (step === "sort_tasks") {
    if (text === t(userId, "sortByDeadline")) {
      ctx.session.sortOption = "deadline";
    } else if (text === t(userId, "sortByStatus")) {
      ctx.session.sortOption = "status";
    } else if (text === t(userId, "sortByCreatedAt")) {
      ctx.session.sortOption = "createdAt";
    } else if (text === t(userId, "sortByUpdatedAt")) {
      ctx.session.sortOption = "updatedAt";
    } else {
      ctx.session.step = "task";
      return showTasksMenu(ctx, ctx.session.taskPage || 0);
    }
  
    ctx.session.taskPage = 0;
    ctx.session.step = "task";
    return showTasksMenu(ctx, 0);
  }

  // Handle number input for navigation
  const isNumber = /^\d+$/.test(text);
  if (!isNumber) return;
  const index = Number(text) - 1;

  if (step === "faq") return handleFAQAnswer(ctx);
  if (step === "task" || step === "linked_tasks") {
    return showTask(ctx, index % TASKS_PER_PAGE);
  }
  if (step === "category")
    return showCategory(ctx, index % CATEGORIES_PER_PAGE);
};
