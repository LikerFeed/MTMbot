
import { Context } from 'telegraf';
import { t } from '../../lang';
import { setReturnContext } from '../../lang';
import { keyboard, LANG_BTN } from '../../bot';

export const showTasksMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showTasksMenu);

  await ctx.reply(
    t(userId, 'tasksMenu'),
    keyboard([
      [t(userId, 'createTask')],
      [t(userId, 'backToMainMenu')],
      [LANG_BTN],
    ])
  );
};