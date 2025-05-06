import { Context } from "telegraf";

import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showTasksMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showTasksMenu);

  await ctx.reply(
    t(userId, "tasksMenu"),
    keyboard([
      [t(userId, "createTask")],
      [t(userId, "backToMainMenu")],
      [LANG_BTN],
    ])
  );
};
