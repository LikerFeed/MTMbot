import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import taskAPI from "../../../api/taskAPI";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

export const handleToggleTaskStatus = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex];
  if (!task || !task._id) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  const newStatus = !task.isCompleted;

  const result = await taskAPI.editTask(ctx, {
    _id: task._id,
    isCompleted: newStatus,
  });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "taskStatusUpdateFail"));
    return;
  }

  ctx.session.tasks[ctx.session.activeTaskIndex] = {
    ...task,
    isCompleted: newStatus,
  };

  await ctx.reply(
    newStatus
      ? t(userId, "taskMarkedCompleted")
      : t(userId, "taskMarkedUncompleted")
  );

  await showTask(ctx, ctx.session.activeTaskIndex);
};
