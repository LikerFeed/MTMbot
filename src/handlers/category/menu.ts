import { BotContext } from "../../types/BotContext";
import { Status } from "../../types/shared";
import { keyboard } from "../../utils";

import categoryAPI from "../../api/categoryAPI";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const CATEGORIES_PER_PAGE = 5;

// Function to show the categories menu
export const showCategoriesMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.session.token) return;

  ctx.session.step = "category";

  const initial = await categoryAPI.getCategories(ctx, {
    page: 1,
    limit: CATEGORIES_PER_PAGE,
  });

  if (initial.status === Status.ERROR || !initial.data) {
    await ctx.reply(t(userId, "categoryFetchFail"));
    return;
  }

  const totalPages = initial.data.totalPages;
  const currentPage = (page + totalPages) % totalPages;

  const result = await categoryAPI.getCategories(ctx, {
    page: currentPage + 1,
    limit: CATEGORIES_PER_PAGE,
  });

  if (result.status === Status.ERROR || !result.data) {
    await ctx.reply(t(userId, "categoryFetchFail"));
    return;
  }

  const { results: categories } = result.data;

  ctx.session.categoryPage = currentPage;
  ctx.session.totalCategoryPages = totalPages;
  ctx.session.categories = categories;

  setReturnContext(userId, () => showCategoriesMenu(ctx, currentPage));

  if (!categories.length) {
    await ctx.reply(
      t(userId, "noCategories"),
      keyboard([
        [t(userId, "createCategory")],
        [t(userId, "backToMainMenu"), LANG_BTN],
      ])
    );
    return;
  }

  const categoryList = categories
    .map(
      (cat, idx) =>
        `${currentPage * CATEGORIES_PER_PAGE + idx + 1}. ${cat.title}`
    )
    .join("\n");

  const numberButtons = categories.map((_, idx) =>
    (currentPage * CATEGORIES_PER_PAGE + idx + 1).toString()
  );

  const numberRows: string[][] = [];
  while (numberButtons.length) numberRows.push(numberButtons.splice(0, 5));

  const menuRows: string[][] = [[t(userId, "createCategory")], ...numberRows];

  if (totalPages > 1) {
    menuRows.push([t(userId, "prev"), t(userId, "next")]);
  }

  menuRows.push([t(userId, "backToMainMenu"), LANG_BTN]);

  await ctx.reply(
    `${t(userId, "categoriesMenu")}\n\n${categoryList}`,
    keyboard(menuRows)
  );
};
