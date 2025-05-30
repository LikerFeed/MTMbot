import { BotContext } from "../../types/BotContext";
import { t } from "../../lang";
import taskTelegramAPI from "../../api/taskTelegramApi";
import { Status } from "../../types/shared";
import { showTasksMenu } from "./menu";

export const startCreateTask = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "create_task_title";
  ctx.session.tempTask = {};

  await ctx.reply(t(userId, "enterTaskTitle"));
};

export const handleCreateTaskTitle = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.message || !('text' in ctx.message)) return;
  const title = ctx.message.text.trim();
  if (!title) return;

  ctx.session.tempTask = {
    ...ctx.session.tempTask,
    title,
  };
  ctx.session.step = "create_task_description";

  await ctx.reply(t(userId, "enterTaskDescription"));
};

export const handleCreateTaskDescription = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.message || !('text' in ctx.message)) return;
  const description = ctx.message.text.trim();
  if (!description) return;

  const temp = ctx.session.tempTask;
  if (!temp?.title) {
    await ctx.reply(t(userId, "taskCreatedFail"));
    ctx.session.step = null;
    return;
  }

  const result = await taskTelegramAPI.addTask(ctx, {
    title: temp.title,
    description,
    user: userId.toString(),
    categories: [],
    deadline: null,
    isCompleted: false,
  });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "taskCreatedFail"));
    ctx.session.step = null;
    return;
  }

  await ctx.reply(t(userId, "taskCreatedSuccess"));
  ctx.session.step = null;
  ctx.session.tempTask = undefined;

  await showTasksMenu(ctx);
};
