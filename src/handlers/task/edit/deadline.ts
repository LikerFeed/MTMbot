import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import taskTelegramAPI from "../../../api/taskTelegramApi";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

export const handleEditTaskDeadline = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex ?? 0];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  ctx.session.step = "edit_task_deadline";

  await ctx.reply(
    `${t(userId, "currentTaskDeadline")}: ${
      task.deadline
        ? new Date(task.deadline).toLocaleDateString()
        : t(userId, "noDeadline")
    }\n${t(userId, "enterNewTaskDeadlineFormat")}`
  );
};

export const handleEditTaskDeadlineText = async (ctx: BotContext) => {
    const userId = ctx.from?.id;
    if (!userId || !("text" in ctx.message!)) return;
  
    const input = ctx.message.text.trim().toLowerCase();
  
    const noValues = ["no", "нема", "немає", "відсутній", "none", "ні", "clear", "очистити", "null"];
  
    const task = ctx.session.tasks?.[ctx.session.activeTaskIndex];
    if (!task || !task._id) {
      await ctx.reply(t(userId, "taskNotFound"));
      return;
    }
  
    if (noValues.includes(input)) {
      const result = await taskTelegramAPI.editTask(ctx, {
        _id: task._id,
        deadline: null,
      });
  
      if (result.status === Status.ERROR) {
        await ctx.reply(t(userId, "taskDeadlineUpdateFail"));
        return;
      }
  
      ctx.session.tasks[ctx.session.activeTaskIndex] = {
        ...task,
        deadline: null,
      };
  
      await ctx.reply(t(userId, "taskDeadlineCleared"));
      ctx.session.step = null;
      await showTask(ctx, ctx.session.activeTaskIndex);
      return;
    }
  
    const [month, day, year] = input.split("/").map(Number);
  
    if (
      !month || !day || !year ||
      month < 1 || month > 12 ||
      day < 1 || day > 31 ||
      year < 2020 || year > 2100
    ) {
      await ctx.reply(t(userId, "invalidTaskDeadlineFormat"));
      return;
    }
  
    const parsedDate = new Date(year, month - 1, day);
    if (isNaN(parsedDate.getTime())) {
      await ctx.reply(t(userId, "invalidTaskDeadlineFormat"));
      return;
    }
  
    const result = await taskTelegramAPI.editTask(ctx, {
      _id: task._id,
      deadline: parsedDate.toISOString(),
    });
  
    if (result.status === Status.ERROR) {
      await ctx.reply(t(userId, "taskDeadlineUpdateFail"));
      return;
    }
  
    ctx.session.tasks[ctx.session.activeTaskIndex] = {
      ...task,
      deadline: parsedDate.toISOString(),
    };
  
    await ctx.reply(t(userId, "taskDeadlineUpdateSuccess"));
    ctx.session.step = null;
  
    await showTask(ctx, ctx.session.activeTaskIndex);
  };
  
