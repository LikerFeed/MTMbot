import { BotContext } from "../../types/BotContext";
import { Status } from "../../types/shared";
import { showCategoriesMenu } from "./menu";

import categoryAPI from "../../api/categoryAPI";
import { t } from "../../lang";

export const startCreateCategory = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "create_category_title";
  await ctx.reply(t(userId, "enterCategoryTitle"));
};

export const handleCreateCategoryTitle = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const text = "text" in ctx.message! ? ctx.message.text.trim() : undefined;
  if (!userId || !text) return;

  const result = await categoryAPI.addCategory(ctx, {
    user: userId.toString(),
    title: text,
    color: "#FFFFFF",
  });

  ctx.session.step = null;

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "categoryCreatedFail"));
    return;
  }

  await ctx.reply(t(userId, "categoryCreatedSuccess"));
  await showCategoriesMenu(ctx);
};
