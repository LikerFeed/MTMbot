import { Context } from 'telegraf';
import { t } from '../../lang';
import { setReturnContext } from '../../lang';
import { keyboard, LANG_BTN } from '../../bot';

export const showCreateTaskMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showCreateTaskMenu);

  await ctx.reply(
    t(userId, 'createTask'),
    keyboard([
      [t(userId, 'backToTasks')],
      [t(userId, 'backToMainMenu')],
      [LANG_BTN],
    ])
  );
}