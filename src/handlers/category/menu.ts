import { BotContext } from "../../types/BotContext";
import categoryTelegramAPI from "../../api/categoryTelegramApi";
import { Status } from "../../types/shared";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const CATEGORIES_PER_PAGE = 5;

export const showCategoriesMenu = async (ctx: BotContext, page = 0) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.session.token) return;

  ctx.session.step = "category";

  const check = await categoryTelegramAPI.getCategories(ctx, {
    page: 1,
    limit: CATEGORIES_PER_PAGE,
  });

  if (check.status === Status.ERROR || !check.data) {
    await ctx.reply(t(userId, "categoryFetchFail"));
    return;
  }

  const totalPages = check.data.totalPages;

  let normalizedPage = page;
  if (page >= totalPages) normalizedPage = 0;
  if (page < 0) normalizedPage = totalPages - 1;

  const result = await categoryTelegramAPI.getCategories(ctx, {
    page: normalizedPage + 1,
    limit: CATEGORIES_PER_PAGE,
  });

  if (result.status === Status.ERROR || !result.data) {
    await ctx.reply(t(userId, "categoryFetchFail"));
    return;
  }

  const { results: categories, page: currentPage } = result.data;

  ctx.session.categoryPage = currentPage - 1;
  ctx.session.totalCategoryPages = totalPages;
  ctx.session.categories = categories;

  setReturnContext(userId, async (ctx) =>
    showCategoriesMenu(ctx, ctx.session.categoryPage || 0)
  );

  if (!Array.isArray(categories) || categories.length === 0) {
    await ctx.reply(
      t(userId, "noCategories"),
      keyboard([
        [t(userId, "createCategory")],
        [t(userId, "backToMainMenu")],
        [LANG_BTN],
      ])
    );
    return;
  }

  const lines = categories
    .map((cat, idx) => `${normalizedPage * CATEGORIES_PER_PAGE + idx + 1}. ${cat.title}`)
    .join("\n");

  const buttons = categories.map((_, idx) => `${normalizedPage * CATEGORIES_PER_PAGE + idx + 1}`);
  const rows: string[][] = [];
  while (buttons.length) rows.push(buttons.splice(0, 5));

  const menuRows: string[][] = [[t(userId, "createCategory")], ...rows];

  if (totalPages > 1) {
    menuRows.push([t(userId, "prev"), t(userId, "next")]);
  }

  menuRows.push([t(userId, "backToMainMenu")], [LANG_BTN]);

  await ctx.reply(
    `${t(userId, "categoriesMenu")}\n\n${lines}`,
    keyboard(menuRows)
  );
};
