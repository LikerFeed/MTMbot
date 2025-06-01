import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import { keyboard } from "../../../utils";
import categoryAPI from "../../../api/categoryAPI";
import taskTelegramAPI from "../../../api/taskTelegramApi";
import { showTask } from "../task";
import { CATEGORIES_PER_PAGE } from "../../category/menu";

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
    const selected = task.categories?.some((c) => c._id === cat._id) ? "✅" : "";
    return `${idx + 1}. ${cat.title} ${selected}`;
  });

  const footer = `\n${t(userId, "chooseCategoryToggle")}`;
  const pagination = keyboard([
    [t(userId, "prev"), t(userId, "next")],
    [t(userId, "backToTask")],
  ]);

  await ctx.reply(lines.join("\n") + footer, pagination);
};

export const handleEditTaskCategoriesText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const text = ctx.message && "text" in ctx.message ? ctx.message.text.trim() : null;
  const taskIndex = ctx.session.activeTaskIndex ?? 0;
  const task = ctx.session.tasks?.[taskIndex];
  if (!userId || !text || !task) return;

  const isNumber = /^\d+$/.test(text);
  if (!isNumber) return;

  const index = Number(text) - 1;
  const page = ctx.session.categoryPage ?? 0;
  const category = ctx.session.categories?.[index];
  if (!category) return;

  const isAlreadySelected = task.categories?.some((c) => c._id === category._id);
  let updatedCategories = task.categories?.map((c) => c._id) ?? [];

  if (isAlreadySelected) {
    updatedCategories = updatedCategories.filter((id) => id !== category._id);
  } else {
    updatedCategories.push(category._id);
  }

  const result = await taskTelegramAPI.editTask(ctx, {
    _id: task._id,
    categories: updatedCategories,
  });

  if (result.status === "error") {
    await ctx.reply(t(userId, "categoryUpdateFail"));
    return;
  }

  ctx.session.tasks![taskIndex] = result.task!;

  await startEditTaskCategories(ctx, page);
};
