import { BotContext } from "../../types/BotContext";

import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const TASKS = Array.from({ length: 14 }, (_, i) => `task${i + 1}`);
const TASKS_PER_PAGE = 10;

export const showTasksMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "task";

  const totalPages = Math.ceil(TASKS.length / TASKS_PER_PAGE);
  const safePage = ((page % totalPages) + totalPages) % totalPages;

  const start = safePage * TASKS_PER_PAGE;
  const currentTasks = TASKS.slice(start, start + TASKS_PER_PAGE);

  setReturnContext(userId, async (ctx) => showTasksMenu(ctx, safePage));

  if (currentTasks.length === 0) {
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

  const taskLines = currentTasks
    .map((task, idx) => `${start + idx + 1}. ${task}`)
    .join("\n");

  const numberButtons = currentTasks.map((_, idx) => `${start + idx + 1}`);
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
