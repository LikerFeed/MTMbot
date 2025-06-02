import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";

import taskAPI from "../../api/taskAPI";
import { showTasksMenu } from "./menu";
import { showTask } from "./task";
import { t, LANG_BTN, setReturnContext } from "../../lang";

// Function to show the delete task confirmation menu
export const showDeleteTaskMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showDeleteTaskMenu);

  await ctx.reply(
    t(userId, "areYouSureDeleteTask"),
    keyboard([
      [t(userId, "yesDeleteTask"), t(userId, "noDeleteTask")],
      [t(userId, "backToTasks"), LANG_BTN],
    ])
  );
};

// Handling confirmation of task deletion
export const handleYesDeleteTask = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const taskIndex = ctx.session.activeTaskIndex ?? 0;
  const task = ctx.session.tasks?.[taskIndex];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  const result = await taskAPI.deleteTask(ctx, task._id);
  if (result.status === "error") {
    await ctx.reply(t(userId, "deleteTaskFail"));
  } else {
    await ctx.reply(t(userId, "deleteTaskSuccess"));
  }

  await showTasksMenu(ctx, ctx.session.taskPage || 0);
};

// Handling cancellation of task deletion
export const handleNoDeleteTask = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const index = ctx.session.activeTaskIndex ?? 0;

  await ctx.reply(t(userId!, "deleteTaskCancel"));
  await showTask(ctx, index);
};
