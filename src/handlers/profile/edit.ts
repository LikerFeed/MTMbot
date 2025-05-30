import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showEditProfileMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  await ctx.reply(
    t(userId, "editProfileMenu"),
    keyboard([
      [t(userId, "editUsername"), t(userId, "editPassword")],
      [t(userId, "backToProfile"), LANG_BTN],
    ])
  );
};
