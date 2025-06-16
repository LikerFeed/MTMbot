import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import taskAPI from "../../../api/taskAPI";
import { Status } from "../../../types/shared";
import { showTask } from "../task";

// Function to handle editing the task deadline
export const handleEditTaskDeadline = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex ?? 0];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  ctx.session.step = "edit_task_deadline";

  const deadlineText = task.deadline
  ? new Date(task.deadline).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  : t(userId, "noDeadline");

  await ctx.reply(
    `${t(userId, "currentTaskDeadline")}: ${deadlineText}\n${t(
      userId,
      "enterNewTaskDeadlineFormat"
    )}`
  );
};

// Function to handle the user's input for editing the task deadline
export const handleEditTaskDeadlineText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const text =
    "text" in ctx.message! ? ctx.message.text.trim().toLowerCase() : null;

  if (!userId || !text) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex];
  if (!task || !task._id) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  const clearValues = [
    "no",
    "нема",
    "немає",
    "відсутній",
    "none",
    "ні",
    "clear",
    "очистити",
    "null",
  ];
  const shouldClear = clearValues.includes(text);

  if (shouldClear) {
    const result = await taskAPI.editTask(ctx, {
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
    return showTask(ctx, ctx.session.activeTaskIndex);
  }

  const dateParts = text.split(".");
  if (dateParts.length !== 3) {
    await ctx.reply(t(userId, "invalidTaskDeadlineFormat"));
    return;
  }

  const [dayStr, monthStr, yearStr] = dateParts;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  let year = parseInt(yearStr, 10);

  if (yearStr.length === 2) {
    year += 2000;
  }

  const isValidDate =
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year >= 2000 &&
    year <= 2100;

  if (!isValidDate) {
    await ctx.reply(t(userId, "invalidTaskDeadlineFormat"));
    return;
  }

  const parsedDate = new Date(year, month - 1, day);
  if (isNaN(parsedDate.getTime())) {
    await ctx.reply(t(userId, "invalidTaskDeadlineFormat"));
    return;
  }

  const result = await taskAPI.editTask(ctx, {
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
