import { BotContext } from "../../types/BotContext";
import taskTelegramAPI from "../../api/taskTelegramApi";
import { Status } from "../../types/shared";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

const TASKS_PER_PAGE = 10;

export const showTasksMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.session.token) return;

  ctx.session.step = "task";

  const pageCheckResult = await taskTelegramAPI.getTasks(ctx, {
    page: 1,
    limit: TASKS_PER_PAGE,
  });

  if (pageCheckResult.status === Status.ERROR || !pageCheckResult.data) {
    await ctx.reply(t(userId, "taskFetchFailed"));
    return;
  }

  const totalPages = pageCheckResult.data.totalPages;

  let normalizedPage = page;
  if (page >= totalPages) normalizedPage = 0;
  if (page < 0) normalizedPage = totalPages - 1;

  const result = await taskTelegramAPI.getTasks(ctx, {
    page: normalizedPage + 1,
    limit: TASKS_PER_PAGE,
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
    showTasksMenu(ctx, ctx.session.taskPage || 0)
  );

  if (!Array.isArray(tasks) || tasks.length === 0) {
    await ctx.reply(
      t(userId, "noTasks"),
      keyboard([
        [t(userId, "createTask")],
        [t(userId, "backToMainMenu")],
        [LANG_BTN],
      ])
    );
    return;
  }

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

  const rows: string[][] = [[t(userId, "createTask")], ...numberRows];

  if (totalPages > 1) {
    rows.push([t(userId, "prev"), t(userId, "next")]);
  }

  rows.push([t(userId, "backToMainMenu")], [LANG_BTN]);

  await ctx.reply(
    `${t(userId, "tasksMenu")}\n\n${taskLines}\n\n${t(
      userId,
      "clickToCreateTask"
    )}`,
    keyboard(rows)
  );
};
