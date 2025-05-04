import { Context } from 'telegraf';
import { t } from '../../lang';
import { setReturnContext } from '../../lang';
import { keyboard, LANG_BTN } from '../../bot';

export const showCreateCategoryMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showCreateCategoryMenu);

  await ctx.reply(
    t(userId, 'createCategory'),
    keyboard([
      [t(userId, 'backToCategories')],
      [t(userId, 'backToMainMenu')],
      [LANG_BTN],
    ])
  );
}