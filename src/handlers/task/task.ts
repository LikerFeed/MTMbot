import { Context } from "telegraf";

import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const TASKS = Array.from({ length: 14 }, (_, i) => ({
  title: `task${i + 1}`,
  description: `desriprtion${i + 1}`,
}));

export const showTask = async (ctx: Context, taskIndex: number) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = TASKS[taskIndex];

  setReturnContext(userId, async (ctx) => showTask(ctx, taskIndex));

  await ctx.reply(
    `${t(userId, "taskTitle")}: ${task.title}\n\n${t(
      userId,
      "taskDescription"
    )}: ${task.description}`,
    keyboard([
      [t(userId, "backToTasks")],
      [t(userId, "backToMainMenu")],
      [LANG_BTN],
    ])
  );
};
