import { Context } from 'telegraf';

import { keyboard } from '../../utils';
import { t , LANG_BTN, setReturnContext } from '../../lang';

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