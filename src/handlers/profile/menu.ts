import { Context } from 'telegraf';

import { keyboard } from '../../utils';
import { t , LANG_BTN, setReturnContext } from '../../lang';

export const showProfileMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  setReturnContext(userId, showProfileMenu);

  await ctx.reply(
    t(userId, 'profileMenu'),
    keyboard([
      [t(userId, 'backToMainMenu')],
      [LANG_BTN],
    ])
  );
};
