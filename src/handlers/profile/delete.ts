import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { menus } from "../menus";

import profileAPI from "../../api/profileAPI";
import { t, LANG_BTN, setReturnContext } from "../../lang";

// Function to show the delete profile confirmation menu
export const showDeleteProfileMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showDeleteProfileMenu);

  await ctx.reply(
    t(userId, "areYouSureDeleteProfile"),
    keyboard([
      [t(userId, "yesDeleteProfile"), t(userId, "noDeleteProfile")],
      [t(userId, "backToMainMenu"), LANG_BTN],
    ])
  );
};

// Handler for confirming profile deletion
export const handleDeleteProfileConfirm = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const result = await profileAPI.deleteAccount(ctx);
  if (result.status === "error") {
    await ctx.reply(t(userId, "deleteProfileFail"));
    return;
  }

  await ctx.reply(t(userId, "deleteProfileSuccess"));

  ctx.session = {
    categories: [],
    totalCategoryPages: 0,
    categoryPage: 0,
    activeCategoryIndex: 0,
    tasks: [],
    totalTaskPages: 0,
    taskPage: 0,
    step: null,
    token: undefined,
    user: undefined,
    activeTaskIndex: 0,
  };

  await menus.showAuthOptions(ctx);
};
