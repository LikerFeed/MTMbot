import { BotContext } from "../../../types/BotContext";
import { t, LANG_BTN } from "../../../lang";
import { keyboard } from "../../../utils";
import categoryAPI from "../../../api/categoryAPI";
import taskAPI from "../../../api/taskAPI";

export const CATEGORIES_PER_PAGE = 5;

// Function to start editing task categories
export const startEditTaskCategories = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  const taskIndex = ctx.session.activeTaskIndex ?? 0;
  const task = ctx.session.tasks?.[taskIndex];
  if (!userId || !task) return;

  ctx.session.step = "edit_task_categories";
  ctx.session.categoryPage = page;

  const { data, status } = await categoryAPI.getCategories(ctx, {
    page: page + 1,
    limit: CATEGORIES_PER_PAGE,
  });

  if (status === "error" || !data) {
    await ctx.reply(t(userId, "categoryLoadError"));
    return;
  }

  ctx.session.categories = data.results;
  ctx.session.totalCategoryPages = data.totalPages;

  const lines = data.results.map((cat, idx) => {
    const isSelected = task.categories?.some((c) => c._id === cat._id);
    const check = isSelected ? "✅" : "";
    return `${idx + 1}. ${cat.title} ${check}`.trim();
  });

  const buttons = data.results.map((_, idx) => `${idx + 1}`);
  const rows: string[][] = [];
  while (buttons.length) rows.push(buttons.splice(0, 5));

  if (data.totalPages > 1) rows.push([t(userId, "prev"), t(userId, "next")]);
  rows.push([t(userId, "backToTask"), LANG_BTN]);

  await ctx.reply(
    `${t(userId, "editTaskCategories")}\n\n${lines.join("\n")}\n\n${t(
      userId,
      "chooseCategoryToggle"
    )}`,
    keyboard(rows)
  );
};

// Handle user's input for editing task categories
export const handleEditTaskCategoriesText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const text = ctx.message && "text" in ctx.message ? ctx.message.text.trim() : null;
  const taskIndex = ctx.session.activeTaskIndex ?? 0;
  const task = ctx.session.tasks?.[taskIndex];
  if (!userId || !text || !task) return;

  const isNumber = /^\d+$/.test(text);
  if (!isNumber) return;

  const index = Number(text) - 1;
  const category = ctx.session.categories?.[index];
  if (!category) return;

  const isAlreadySelected = task.categories?.some((c) => c._id === category._id);
  let updatedCategories = task.categories?.map((c) => c._id) ?? [];

  if (isAlreadySelected) {
    updatedCategories = updatedCategories.filter((id) => id !== category._id);
  } else {
    updatedCategories.push(category._id);
  }

  const result = await taskAPI.editTask(ctx, {
    _id: task._id,
    categories: updatedCategories,
  });

  if (result.status === "error") {
    await ctx.reply(t(userId, "categoryUpdateFail"));
    return;
  }

  ctx.session.tasks![taskIndex] = result.task!;
  await startEditTaskCategories(ctx, ctx.session.categoryPage ?? 0);
};
