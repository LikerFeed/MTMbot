import { BotContext } from "../..//types/BotContext";
import { t } from "../../lang";
import categoryAPI from "../../api/categoryAPI";
import { Status } from "../../types/shared";
import { showCategory } from "./category";

export const handleEditCategoryTitle = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const category = ctx.session.categories?.[ctx.session.activeCategoryIndex ?? 0];
  if (!category) {
    await ctx.reply(t(userId, "categoryNotFound"));
    return;
  }

  ctx.session.step = "edit_category_title";

  await ctx.reply(
    `${t(userId, "currentCategoryTitle")}: ${category.title}\n${t(
      userId,
      "enterNewCategoryTitle"
    )}`
  );
};

export const handleEditCategoryTitleText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text.trim() : undefined;
  if (!userId || !text) return;

  const categoryIndex = ctx.session.activeCategoryIndex ?? 0;
  const category = ctx.session.categories?.[categoryIndex];
  if (!category) {
    await ctx.reply(t(userId, "categoryNotFound"));
    return;
  }

  const result = await categoryAPI.editCategory(ctx, {
    _id: category._id,
    title: text,
    color: category.color,
  });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "categoryTitleUpdateFail"));
    return;
  }

  ctx.session.categories![categoryIndex] = {
    ...category,
    title: text,
  };

  await ctx.reply(t(userId, "categoryTitleUpdateSuccess"));
  ctx.session.step = null;

  await showCategory(ctx, categoryIndex);
};
