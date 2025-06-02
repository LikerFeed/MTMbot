import { BotContext } from "../../types/BotContext";
import { Status } from "../../types/shared";
import { showTasksMenu } from "./menu";

import taskAPI from "../../api/taskAPI";
import { t } from "../../lang";

type CreateTaskStep = "title" | "description";
type TaskCreateSession = {
  step: CreateTaskStep;
  title?: string;
};

const taskCreateSessions = new Map<number, TaskCreateSession>();

// Start the task creation process
export const startCreateTask = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  taskCreateSessions.set(userId, { step: "title" });
  ctx.session.step = "create_task";
  await ctx.reply(t(userId, "enterTaskTitle"));
};

// Handle the user's input during task creation
export const handleCreateTask = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !("text" in ctx.message!)) return;

  const session = taskCreateSessions.get(userId);
  if (!session) return;

  const text = ctx.message.text.trim();
  if (!text) return;

  if (session.step === "title") {
    taskCreateSessions.set(userId, { step: "description", title: text });
    await ctx.reply(t(userId, "enterTaskDescription"));
    return;
  }

  if (session.step === "description") {
    const title = session.title!;
    const description = text;

    const result = await taskAPI.addTask(ctx, {
      title,
      description,
      user: userId.toString(),
      categories: [],
      deadline: null,
      isCompleted: false,
    });

    taskCreateSessions.delete(userId);
    ctx.session.step = null;

    if (result.status === Status.ERROR) {
      await ctx.reply(t(userId, "taskCreatedFail"));
      return;
    }

    await ctx.reply(t(userId, "taskCreatedSuccess"));
    await showTasksMenu(ctx);
  }
};
