import { Context } from 'telegraf';
import { LANG_OPTIONS, setReturnContext, t } from '../lang';
import { keyboard } from '../bot';

export const showLanguageSelection = async (
  ctx: Context,
  returnTo?: (ctx: Context) => Promise<void>,
  isFirst = false
) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  if (returnTo) setReturnContext(userId, returnTo);

  const msg = LANG_OPTIONS
    .map(lang => isFirst ? lang.messages.firstTimeStartMessage : lang.messages.languageChoicePrompt)
    .join('\n');

  const buttons = LANG_OPTIONS.map(lang => [lang.label]);

  await ctx.reply(msg, keyboard(buttons));
};
