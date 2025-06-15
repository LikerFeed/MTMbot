import { BotContext } from "../../types/BotContext";
import { TASKS_PER_PAGE } from "../task/menu";
import { Status } from "../../types/shared";
import { keyboard } from "../../utils";

import taskAPI from "../../api/taskAPI";
import { t, LANG_BTN, setReturnContext } from "../../lang";

// Function to show linked tasks menu for a specific category
export const showLinkedTasksMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  const activeCategory =
    ctx.session.categories?.[ctx.session.activeCategoryIndex ?? 0];
  if (!userId || !ctx.session.token || !activeCategory) return;

  ctx.session.step = "linked_tasks";
  const categoryId = activeCategory._id;

  const result = await taskAPI.getTasks(ctx, {
    page: page + 1,
    limit: TASKS_PER_PAGE,
    categories: [categoryId],
  });

  if (result.status === Status.ERROR || !result.data) {
    await ctx.reply(t(userId, "taskFetchFailed"));
    return;
  }

  const { tasks, totalPages, currentPage } = result.data;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    await ctx.reply(
      t(userId, "noTasksInCategory"),
      keyboard([
        [t(userId, "backToCategory"), t(userId, "backToMainMenu")],
        [LANG_BTN],
      ])
    );
    return;
  }

  const normalizedPage = currentPage - 1;

  ctx.session.taskPage = normalizedPage;
  ctx.session.totalTaskPages = totalPages;
  ctx.session.tasks = tasks;

  setReturnContext(userId, async (ctx) =>
    showLinkedTasksMenu(ctx, ctx.session.taskPage || 0)
  );

  const taskLines = tasks
    .map(
      (task, idx) =>
        `${normalizedPage * TASKS_PER_PAGE + idx + 1}. ${task.title}`
    )
    .join("\n");

  const numberButtons = tasks.map(
    (_, idx) => `${normalizedPage * TASKS_PER_PAGE + idx + 1}`
  );
  const numberRows: string[][] = [];
  while (numberButtons.length) numberRows.push(numberButtons.splice(0, 5));

  const rows: string[][] = [...numberRows];

  if (totalPages > 1) {
    rows.push([t(userId, "prev"), t(userId, "next")]);
  }

  rows.push(
    [t(userId, "backToCategory"), t(userId, "backToMainMenu")],
    [LANG_BTN]
  );

  await ctx.reply(
    `${t(userId, "linkedTasksMenu")}\n\n${taskLines}`,
    keyboard(rows)
  );
};
