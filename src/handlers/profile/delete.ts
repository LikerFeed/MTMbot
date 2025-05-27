import { Context } from "telegraf";

import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showDeleteProfileMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showDeleteProfileMenu);

  await ctx.reply(
    t(userId, "areYouSureDeleteProfile"),
    keyboard([
        [t(userId, "yesDelete"), t(userId, "noCancel")],
        [t(userId, "backToMainMenu"), LANG_BTN]
    ])
  );
};
