import { BotContext } from "../../types/BotContext";
import { Status } from "../../types/shared";
import { showTasksMenu } from "./menu";
import { showLinkedTasksMenu } from "../category/tasks";

import taskAPI from "../../api/taskAPI";
import { t } from "../../lang";

type CreateTaskStep = "title" | "description";
type TaskCreateSession = {
  step: CreateTaskStep;
  title?: string;
  categoryId?: string;
};

const taskCreateSessions = new Map<number, TaskCreateSession>();

// Start the task creation process
export const startCreateTask = async (ctx: BotContext, categoryId?: string) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  taskCreateSessions.set(userId, { step: "title" });
  ctx.session.step = "create_task";
  
  if (categoryId) {
    ctx.session.tempTask = { ...ctx.session.tempTask, categoryId };
  }

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
    const categoryId = ctx.session.tempTask?.categoryId;

    const result = await taskAPI.addTask(ctx, {
      title,
      description,
      user: userId.toString(),
      categories: categoryId ? [categoryId] : [],
      deadline: null,
      isCompleted: false,
    });
  
    taskCreateSessions.delete(userId);
    ctx.session.step = null;
    ctx.session.tempTask = undefined;
  
    if (result.status === Status.ERROR) {
      await ctx.reply(t(userId, "taskCreatedFail"));
      return;
    }
  
    await ctx.reply(t(userId, "taskCreatedSuccess"));
  
    if (categoryId) {
      return showLinkedTasksMenu(ctx);
    } else {
      return showTasksMenu(ctx);
    }    
  }  
};
