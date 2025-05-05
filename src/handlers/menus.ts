import { Context } from 'telegraf';

import { keyboard } from '../utils';
import { LANG_BTN, LANG_OPTIONS, setReturnContext, t } from '../lang';

const createMenu = (
  messageKey: keyof typeof LANG_OPTIONS[0]['messages'],
  buttonRows: (ctx: Context, userId: number) => string[][]
): ((ctx: Context) => Promise<void>) =>
  async ctx => {
    const userId = ctx.from?.id;
    if (!userId) return;

    setReturnContext(userId, createMenu(messageKey, buttonRows));
    await ctx.reply(t(userId, messageKey), keyboard(buttonRows(ctx, userId)));
  };

export const menus = {
  showAuthOptions: createMenu('chooseAuth', (ctx, userId) => [[t(userId, 'signIn'), t(userId, 'signUp')], [LANG_BTN]]),
  showMainMenu: createMenu('mainMenuMessage', (ctx, userId) => [
    [t(userId, 'tasks'), t(userId, 'categories')],
    [t(userId, 'profile'), t(userId, 'faq')],
    [t(userId, 'logout'), LANG_BTN],
  ]),
};