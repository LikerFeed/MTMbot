import { Context } from "telegraf";

import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showCategoriesMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showCategoriesMenu);

  await ctx.reply(
    t(userId, "categoriesMenu"),
    keyboard([
      [t(userId, "createCategory")],
      [t(userId, "backToMainMenu")],
      [LANG_BTN],
    ])
  );
};
