import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { t } from "../../lang";

export const showSortTasksMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "sort_tasks";

  await ctx.reply(
    t(userId, "chooseSortOption"),
    keyboard([
      [t(userId, "sortByDeadline"), t(userId, "sortByStatus")],
      [t(userId, "backToTasks")],
    ])
  );
};
