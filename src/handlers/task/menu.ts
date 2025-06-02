import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";

import taskAPI from "../../api/taskAPI";

import { Status } from "../../types/shared";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const TASKS_PER_PAGE = 10;

// Function to show the tasks menu
export const showTasksMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.session.token) return;

  ctx.session.step = "task";

  const firstPageResult = await taskAPI.getTasks(ctx, {
    page: 1,
    limit: TASKS_PER_PAGE,
  });

  if (firstPageResult.status === Status.ERROR || !firstPageResult.data) {
    await ctx.reply(t(userId, "taskFetchFailed"));
    return;
  }

  const totalPages = firstPageResult.data.totalPages;

  let normalizedPage = page;
  if (page >= totalPages) normalizedPage = 0;
  if (page < 0) normalizedPage = totalPages - 1;

  const currentPageResult = await taskAPI.getTasks(ctx, {
    page: normalizedPage + 1,
    limit: TASKS_PER_PAGE,
  });

  if (currentPageResult.status === Status.ERROR || !currentPageResult.data) {
    await ctx.reply(t(userId, "taskFetchFailed"));
    return;
  }

  const { tasks, currentPage } = currentPageResult.data;

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
        [t(userId, "backToMainMenu"), LANG_BTN],
      ])
    );
    return;
  }

  let tasksToShow = [...tasks];

  if (ctx.session.sortOption === "deadline") {
    tasksToShow.sort((a, b) => {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return aTime - bTime;
    });
  }

  if (ctx.session.sortOption === "status") {
    tasksToShow.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }

  const taskLines = tasksToShow
    .map(
      (task, idx) =>
        `${normalizedPage * TASKS_PER_PAGE + idx + 1}. ${task.title}`
    )
    .join("\n");

  const numberButtons = tasksToShow.map(
    (_, idx) => `${normalizedPage * TASKS_PER_PAGE + idx + 1}`
  );

  const numberRows: string[][] = [];
  while (numberButtons.length) numberRows.push(numberButtons.splice(0, 5));

  const rows: string[][] = [[t(userId, "createTask")], ...numberRows];

  if (totalPages > 1) {
    rows.push([t(userId, "prev"), t(userId, "sortTasks"), t(userId, "next")]);
  } else if (tasksToShow.length > 0) {
    rows.push([t(userId, "sortTasks")]);
  }

  rows.push([t(userId, "backToMainMenu"), LANG_BTN]);

  await ctx.reply(
    `${t(userId, "tasksMenu")}\n\n${taskLines}\n\n${t(
      userId,
      "clickToCreateTask"
    )}`,
    keyboard(rows)
  );
};
