import { BotContext } from "../../types/BotContext";
import taskAPI from "../../api/taskAPI";
import { TASKS_PER_PAGE } from "../task/menu";
import { Status } from "../../types/shared";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showLinkedTasksMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  const activeCategory = ctx.session.categories?.[ctx.session.activeCategoryIndex ?? 0];
  if (!userId || !ctx.session.token || !activeCategory) return;

  ctx.session.step = "task";
  const categoryId = activeCategory._id;

  const checkResult = await taskAPI.getTasks(ctx, {
    page: 1,
    limit: TASKS_PER_PAGE,
    categories: [categoryId],
  });

  if (checkResult.status === Status.ERROR || !checkResult.data) {
    await ctx.reply(t(userId, "taskFetchFailed"));
    return;
  }

  const totalPages = checkResult.data.totalPages;
  let normalizedPage = page;
  if (page >= totalPages) normalizedPage = 0;
  if (page < 0) normalizedPage = totalPages - 1;

  const result = await taskAPI.getTasks(ctx, {
    page: normalizedPage + 1,
    limit: TASKS_PER_PAGE,
    categories: [categoryId],
  });

  if (result.status === Status.ERROR || !result.data) {
    await ctx.reply(t(userId, "taskFetchFailed"));
    return;
  }

  const { tasks, currentPage } = result.data;

  ctx.session.taskPage = currentPage - 1;
  ctx.session.totalTaskPages = totalPages;
  ctx.session.tasks = tasks;

  setReturnContext(userId, async (ctx) =>
    showLinkedTasksMenu(ctx, ctx.session.taskPage || 0)
  );

  if (!Array.isArray(tasks) || tasks.length === 0) {
    await ctx.reply(
      t(userId, "noTasksInCategory"),
      keyboard([
        [t(userId, "backToCategory")],
        [t(userId, "backToMainMenu")],
        [LANG_BTN],
      ])
    );
    return;
  }

  const taskLines = tasks
    .map((task, idx) => `${normalizedPage * TASKS_PER_PAGE + idx + 1}. ${task.title}`)
    .join("\n");

  const numberButtons = tasks.map((_, idx) => `${normalizedPage * TASKS_PER_PAGE + idx + 1}`);
  const numberRows: string[][] = [];
  while (numberButtons.length) numberRows.push(numberButtons.splice(0, 5));

  const rows: string[][] = [[t(userId, "createTask")], ...numberRows];

  if (totalPages > 1) {
    rows.push([t(userId, "prev"), t(userId, "sortTasks"), t(userId, "next")]);
  }

  rows.push([t(userId, "backToCategory")], [t(userId, "backToMainMenu")], [LANG_BTN]);

  await ctx.reply(
    `${t(userId, "linkedTasksMenu")}\n\n${taskLines}`,
    keyboard(rows)
  );
};
