import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";

import taskAPI from "../../api/taskAPI";

import { Status } from "../../types/shared";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const TASKS_PER_PAGE = 10;

export const showTasksMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.session.token) return;

  ctx.session.step = "task";

  const allTasksResult = await taskAPI.getTasks(ctx, {
    page: 1,
    limit: 9999,
  });

  if (allTasksResult.status === Status.ERROR || !allTasksResult.data) {
    await ctx.reply(t(userId, "taskFetchFailed"));
    return;
  }

  const allTasks = allTasksResult.data.tasks;

  if (!Array.isArray(allTasks) || allTasks.length === 0) {
    await ctx.reply(
      t(userId, "noTasks"),
      keyboard([
        [t(userId, "createTask")],
        [t(userId, "backToMainMenu"), LANG_BTN],
      ])
    );
    return;
  }

  if (ctx.session.sortOption === "deadline") {
    allTasks.sort((a, b) => {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return aTime - bTime;
    });
  }

  if (ctx.session.sortOption === "status") {
    allTasks.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }

  const totalPages = Math.ceil(allTasks.length / TASKS_PER_PAGE);
  let normalizedPage = page;
  if (normalizedPage >= totalPages) normalizedPage = 0;
  if (normalizedPage < 0) normalizedPage = totalPages - 1;

  const pagedTasks = allTasks.slice(
    normalizedPage * TASKS_PER_PAGE,
    normalizedPage * TASKS_PER_PAGE + TASKS_PER_PAGE
  );

  ctx.session.taskPage = normalizedPage;
  ctx.session.totalTaskPages = totalPages;
  ctx.session.tasks = pagedTasks;

  setReturnContext(userId, async (ctx) =>
    showTasksMenu(ctx, ctx.session.taskPage || 0)
  );

  const taskLines = pagedTasks
    .map((task, idx) => {
      const index = normalizedPage * TASKS_PER_PAGE + idx + 1;
      let line = `${index}. ${task.title}`;

      if (ctx.session.sortOption === "deadline") {
        if (task.deadline) {
          const date = new Date(task.deadline);
          const formatted = date.toLocaleDateString("uk-UA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          line += ` ${formatted}`;
        } else {
          line += " ❌";
        }
      }

      if (ctx.session.sortOption === "status") {
        line += task.isCompleted ? " ✅" : " ❌";
      }

      return line;
    })
    .join("\n");

  const numberButtons = pagedTasks.map(
    (_, idx) => `${normalizedPage * TASKS_PER_PAGE + idx + 1}`
  );

  const numberRows: string[][] = [];
  while (numberButtons.length) numberRows.push(numberButtons.splice(0, 5));

  const rows: string[][] = [[t(userId, "createTask")], ...numberRows];

  if (totalPages > 1) {
    rows.push([t(userId, "prev"), t(userId, "sortTasks"), t(userId, "next")]);
  } else if (pagedTasks.length > 0) {
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
