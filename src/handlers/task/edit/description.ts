import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import taskAPI from "../../../api/taskAPI";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

export const handleEditTaskDescription = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex ?? 0];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  ctx.session.step = "edit_task_description";

  await ctx.reply(
    `${t(userId, "currentTaskDescription")}: ${task.description}\n${t(
      userId,
      "enterNewTaskDescription"
    )}`
  );
};

export const handleEditTaskDescriptionText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!("text" in ctx.message!)) return;
  const text = ctx.message.text.trim();

  if (!userId || !text) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex];
  if (!task || !task._id) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  const result = await taskAPI.editTask(ctx, {
    _id: task._id,
    description: text,
  });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "taskDescriptionUpdateFail"));
    return;
  }

  ctx.session.tasks[ctx.session.activeTaskIndex] = {
    ...task,
    description: text,
  };

  await ctx.reply(t(userId, "taskDescriptionUpdateSuccess"));
  ctx.session.step = null;

  await showTask(ctx, ctx.session.activeTaskIndex);
};
