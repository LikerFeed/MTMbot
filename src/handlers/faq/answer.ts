import { BotContext } from "../../types/BotContext";

import { t, LANG_OPTIONS } from "../../lang";

export const handleFAQAnswer = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.message || !("text" in ctx.message)) return;

  const number = ctx.message.text;
  const question = t(
    userId,
    `question${number}` as keyof (typeof LANG_OPTIONS)[0]["messages"]
  );
  const answer = t(
    userId,
    `answer${number}` as keyof (typeof LANG_OPTIONS)[0]["messages"]
  );
  const followup = t(userId, "chooseAnotherQuestion");

  await ctx.reply(`${number}. ${question}\n\n${answer}\n\n${followup}`);
};
