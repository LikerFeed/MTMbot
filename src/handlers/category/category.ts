import { BotContext } from "../../types/BotContext";
import { Category } from "../../types/entities/Category";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";

export const showCategory = async (ctx: BotContext, categoryIndex: number) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const category: Category | undefined = ctx.session.categories?.[categoryIndex];
  if (!category) {
    await ctx.reply(t(userId, "categoryNotFound"));
    return;
  }

  ctx.session.activeCategoryIndex = categoryIndex;

  setReturnContext(userId, async (ctx) => showCategory(ctx, categoryIndex));

  const message = `
<b>${t(userId, "categoryTitle")}:</b> ${category.title}
  `.trim();

  await ctx.replyWithHTML(
    message,
    keyboard([
      [t(userId, "backToCategories")],
      [t(userId, "backToMainMenu"), LANG_BTN],
    ])
  );
};
