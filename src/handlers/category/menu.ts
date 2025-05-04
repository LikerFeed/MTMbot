
import { Context } from 'telegraf';
import { t } from '../../lang';
import { setReturnContext } from '../../lang';
import { keyboard, LANG_BTN } from '../../bot';

export const showCategoriesMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showCategoriesMenu);

  await ctx.reply(
    t(userId, 'categoriesMenu'),
    keyboard([
      [t(userId, 'createCategory')],
      [t(userId, 'backToMainMenu')],
      [LANG_BTN],
    ])
  );
};