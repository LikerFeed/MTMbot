import { Context } from 'telegraf';

import { keyboard } from '../../utils';
import { t , LANG_BTN, LANG_OPTIONS } from '../../lang';

export const FAQ_NUMBERS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
const FAQ_BUTTON_ROWS = Array.from({ length: 2 }, (_, i) => FAQ_NUMBERS.slice(i * 5, i * 5 + 5));

export const showFAQMenu = async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const questions = FAQ_NUMBERS.map(
    n => `${n}. ${t(userId, `question${n}` as keyof typeof LANG_OPTIONS[0]['messages'])}`
  );

  const msg = `${t(userId, 'chooseQuestion')}

${questions.join('\n')}`;

  await ctx.reply(
    msg,
    keyboard([
      [t(userId, 'showQuestions')],
      ...FAQ_BUTTON_ROWS,
      [t(userId, 'backToMainMenu')],
      [LANG_BTN],
    ])
  );
};