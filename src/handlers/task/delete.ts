import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showDeleteTaskMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showDeleteTaskMenu);

  await ctx.reply(
    t(userId, "areYouSureDeleteTask"),
    keyboard([
      [t(userId, "yesDeleteTask"), t(userId, "noDeleteTask")],
      [t(userId, "backToTasks"), LANG_BTN],
    ])
  );
};
