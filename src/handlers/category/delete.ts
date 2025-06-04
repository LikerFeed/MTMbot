import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { Status } from "../../types/shared";
import { showCategoriesMenu } from "./menu";

import categoryAPI from "../../api/categoryAPI";
import { t, LANG_BTN, setReturnContext } from "../../lang";

// Function to show the delete category confirmation menu
export const showDeleteCategoryMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "delete_category_confirm";
  setReturnContext(userId, showDeleteCategoryMenu);

  await ctx.reply(
    t(userId, "areYouSureDeleteCategory"),
    keyboard([
      [t(userId, "yesDeleteCategory"), t(userId, "noDeleteCategory")],
      [t(userId, "backToCategories"), LANG_BTN],
    ])
  );
};

// Handling confirmation of category deletion
export const handleYesDeleteCategory = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const index = ctx.session.activeCategoryIndex ?? 0;
  const category = ctx.session.categories?.[index];

  if (!category) {
    await ctx.reply(t(userId, "categoryNotFound"));
    return;
  }

  const result = await categoryAPI.deleteCategory(ctx, category._id);

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "categoryDeleteFail"));
  } else {
    ctx.session.categories?.splice(index, 1);
    await ctx.reply(t(userId, "categoryDeleteSuccess"));
  }

  ctx.session.step = null;
  await showCategoriesMenu(ctx);
};

// Handling cancellation of category deletion
export const handleNoDeleteCategory = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = null;
  await ctx.reply(t(userId, "categoryDeleteCancel"));
  await showCategoriesMenu(ctx, ctx.session.categoryPage || 0);
};
