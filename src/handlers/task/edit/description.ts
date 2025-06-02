import { BotContext } from "../../../types/BotContext";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

import { t } from "../../../lang";
import taskAPI from "../../../api/taskAPI";

// Function to handle editing the task description
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

// Function to handle the user's input for editing the task description
export const handleEditTaskDescriptionText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !("text" in ctx.message!)) return;

  const text = ctx.message.text.trim();
  if (!text) return;

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

  ctx.session.step = null;

  await ctx.reply(t(userId, "taskDescriptionUpdateSuccess"));
  await showTask(ctx, ctx.session.activeTaskIndex);
};
