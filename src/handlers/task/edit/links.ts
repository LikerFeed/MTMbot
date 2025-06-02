import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import taskAPI from "../../../api/taskAPI";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Function to handle editing the task links
export const handleEditTaskLinks = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex ?? 0];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  ctx.session.step = "edit_task_links";

  const currentLinks = task.links?.length
    ? task.links.join("\n")
    : t(userId, "noLinks");

  await ctx.reply(
    `${t(userId, "currentTaskLinks")}:\n${currentLinks}\n\n${t(
      userId,
      "enterNewTaskLinks"
    )}`
  );
};

// Function to handle the user's input for editing the task links
export const handleEditTaskLinksText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !("text" in ctx.message!)) return;

  const input = ctx.message.text.trim();
  const lowered = input.toLowerCase();
  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex];

  if (!task || !task._id) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  const shouldClear = [
    "no",
    "нема",
    "немає",
    "none",
    "ні",
    "відсутні",
    "очистити",
    "clear",
    "null",
  ].includes(lowered);

  if (shouldClear) {
    const result = await taskAPI.editTask(ctx, { _id: task._id, links: [] });

    if (result.status === Status.ERROR) {
      await ctx.reply(t(userId, "taskLinksUpdateFail"));
      return;
    }

    ctx.session.tasks[ctx.session.activeTaskIndex] = { ...task, links: [] };
    ctx.session.step = null;

    await ctx.reply(t(userId, "taskLinksCleared"));
    return showTask(ctx, ctx.session.activeTaskIndex);
  }

  const rawLinks = input
    .split(/[\s\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const links = rawLinks.filter(isValidUrl);

  const result = await taskAPI.editTask(ctx, { _id: task._id, links });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "taskLinksUpdateFail"));
    return;
  }

  ctx.session.tasks[ctx.session.activeTaskIndex] = { ...task, links };
  ctx.session.step = null;

  await ctx.reply(t(userId, "taskLinksUpdateSuccess"));
  await showTask(ctx, ctx.session.activeTaskIndex);
};
