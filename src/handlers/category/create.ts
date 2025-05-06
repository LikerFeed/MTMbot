import { Context } from "telegraf";

import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showCreateCategoryMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showCreateCategoryMenu);

  await ctx.reply(
    t(userId, "createCategory"),
    keyboard([
      [t(userId, "backToCategories")],
      [t(userId, "backToMainMenu")],
      [LANG_BTN],
    ])
  );
};
