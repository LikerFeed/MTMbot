import { Context } from 'telegraf';
import { LANG_OPTIONS, setReturnContext, t } from '../lang';
import { keyboard } from '../bot';

export const createMenu = (
  messageKey: keyof typeof LANG_OPTIONS[0]['messages'],
  buttonRows: (ctx: Context, userId: number) => string[][]
): ((ctx: Context) => Promise<void>) =>
  async ctx => {
    const userId = ctx.from?.id;
    if (!userId) return;

    setReturnContext(userId, createMenu(messageKey, buttonRows));
    await ctx.reply(t(userId, messageKey), keyboard(buttonRows(ctx, userId)));
  };
