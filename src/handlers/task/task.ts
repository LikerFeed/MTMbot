import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

import { Task } from "../../types/entities/Task";

// Function to show a specific task
export const showTask = async (ctx: BotContext, taskIndex: number) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task: Task | undefined = ctx.session.tasks?.[taskIndex];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  ctx.session.activeTaskIndex = taskIndex;
  setReturnContext(userId, async (ctx) => showTask(ctx, taskIndex));

  const status = task.isCompleted
    ? t(userId, "completed")
    : t(userId, "notCompleted");

  const deadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString()
    : t(userId, "noDeadline");

  const categories = task.categories?.length
    ? task.categories.map((cat) => cat.title).join(", ")
    : t(userId, "noCategories");

  const links = task.links?.length
    ? task.links.join("\n")
    : t(userId, "noLinks");

  const message = [
    `<b>${t(userId, "taskTitle")}:</b> ${task.title}`,
    `<b>${t(userId, "taskDescription")}:</b> ${task.description}`,
    `<b>${t(userId, "taskDeadline")}:</b> ${deadline}`,
    `<b>${t(userId, "taskStatus")}:</b> ${status}`,
    `<b>${t(userId, "taskCategories")}:</b> ${categories}`,
    `<b>${t(userId, "taskLinks")}:</b> ${links}`,
  ].join("\n");

  await ctx.replyWithHTML(
    message,
    keyboard([
      [t(userId, "editTask"), t(userId, "deleteTask")],
      [t(userId, "backToTasks"), t(userId, "backToMainMenu")],
      [LANG_BTN],
    ])
  );
};
