import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { t, LANG_BTN } from "../../lang";

// Show edit options for a specific task
export const showEditTaskMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const task = ctx.session.tasks?.[ctx.session.activeTaskIndex ?? 0];
  if (!task) {
    await ctx.reply(t(userId, "taskNotFound"));
    return;
  }

  await ctx.reply(
    t(userId, "editTask"),
    keyboard([
      [t(userId, "editTaskTitle"), t(userId, "editTaskDescription")],
      [t(userId, "editTaskDeadline"), t(userId, "editTaskStatus")],
      [t(userId, "editTaskCategories"), t(userId, "editTaskLinks")],
      [t(userId, "backToTask"), LANG_BTN],
    ])
  );
};
