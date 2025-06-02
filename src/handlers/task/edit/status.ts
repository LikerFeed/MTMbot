import { BotContext } from "../../../types/BotContext";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

import taskAPI from "../../../api/taskAPI";
import { t } from "../../../lang";

// Function to handle toggling the task status
export const handleToggleTaskStatus = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex];
  if (!task || !task._id) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  const updatedStatus = !task.isCompleted;

  const result = await taskAPI.editTask(ctx, {
    _id: task._id,
    isCompleted: updatedStatus,
  });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "taskStatusUpdateFail"));
    return;
  }

  ctx.session.tasks[ctx.session.activeTaskIndex] = {
    ...task,
    isCompleted: updatedStatus,
  };

  const statusMessage = updatedStatus
    ? t(userId, "taskMarkedCompleted")
    : t(userId, "taskMarkedUncompleted");

  await ctx.reply(statusMessage);
  await showTask(ctx, ctx.session.activeTaskIndex);
};
