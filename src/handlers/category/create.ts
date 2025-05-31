import { BotContext } from "../../types/BotContext";
import categoryTelegramAPI from "../../api/categoryTelegramApi";
import { Status } from "../../types/shared";
import { showCategoriesMenu } from "./menu";
import { t } from "../../lang";

export const startCreateCategory = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "create_category_title";
  await ctx.reply(t(userId, "enterCategoryTitle"));
};

export const handleCreateCategoryTitle = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text.trim() : undefined;
  if (!userId || !text) return;

  const result = await categoryTelegramAPI.addCategory(ctx, {
    user: userId.toString(),
    title: text,
    color: "#FFFFFF"
  });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "categoryCreatedFail"));
    ctx.session.step = null;
    return;
  }

  await ctx.reply(t(userId, "categoryCreatedSuccess"));
  ctx.session.step = null;

  await showCategoriesMenu(ctx);
};