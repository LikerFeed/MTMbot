import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import taskTelegramAPI from "../../../api/taskTelegramApi";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

export const handleEditTaskTitle = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex ?? 0];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  ctx.session.step = "edit_task_title";

  await ctx.reply(
    `${t(userId, "currentTaskTitle")}: ${task.title}\n${t(userId, "enterNewTaskTitle")}`
  );
};

export const handleEditTaskTitleText = async (ctx: BotContext) => {
    const userId = ctx.from?.id;
    if (!("text" in ctx.message!)) return;
    const text = ctx.message.text.trim();
  
    if (!userId || !text) return;
  
    const task = ctx.session.tasks?.[ctx.session.activeTaskIndex];
    if (!task || !task._id) {
      await ctx.reply(t(userId, "taskNotFound"));
      return;
    }
  
    const result = await taskTelegramAPI.editTask(ctx, {
      _id: task._id,
      title: text,
    });
  
    if (result.status === Status.ERROR) {
      await ctx.reply(t(userId, "taskTitleUpdateFail"));
      return;
    }
  
    ctx.session.tasks[ctx.session.activeTaskIndex] = {
      ...task,
      title: text,
    };
  
    await ctx.reply(t(userId, "taskTitleUpdateSuccess"));
    ctx.session.step = null;
  
    await showTask(ctx, ctx.session.activeTaskIndex);
  };
  
