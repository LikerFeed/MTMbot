import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";

import categoryAPI from "../../api/categoryAPI";
import { Status } from "../../types/shared";
import { showCategoriesMenu } from "./menu";

import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showDeleteCategoryMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "delete_category_confirm";
  setReturnContext(userId, showDeleteCategoryMenu);

  await ctx.reply(
    t(userId, "areYouSureDeleteCategory"),
    keyboard([
      [t(userId, "yesDeleteCategory"), t(userId, "noDeleteCategory")],
      [t(userId, "backToCategories")],
      [LANG_BTN],
    ])
  );
};

export const handleDeleteCategoryConfirm = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
  if (!userId || !text) return;

  const categoryIndex = ctx.session.activeCategoryIndex ?? 0;
  const category = ctx.session.categories?.[categoryIndex];
  if (!category) {
    await ctx.reply(t(userId, "categoryNotFound"));
    ctx.session.step = null;
    return;
  }

  if (text === t(userId, "yesDeleteCategory")) {
    const result = await categoryAPI.deleteCategory(ctx, category._id);

    if (result.status === Status.ERROR) {
      await ctx.reply(t(userId, "categoryDeleteFail"));
    } else {
      ctx.session.categories?.splice(categoryIndex, 1);
      await ctx.reply(t(userId, "categoryDeleteSuccess"));
    }

    ctx.session.step = null;
    await showCategoriesMenu(ctx);
  } else if (text === t(userId, "noDeleteCategory")) {
    ctx.session.step = null;
    await ctx.reply(t(userId, "categoryDeleteCancel"));
    await showCategoriesMenu(ctx);
  }
};
