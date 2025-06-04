import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { FAQ_BUTTON_ROWS } from "./question";
import { t, LANG_OPTIONS, LANG_BTN } from "../../lang";

// This function handles the FAQ answer based on the user's selection
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

  await ctx.reply(
    `${number}. ${question}\n\n${answer}\n\n${followup}`,
    keyboard([
      [t(userId, "showQuestions")],
      ...FAQ_BUTTON_ROWS,
      [t(userId, "backToMainMenu"), LANG_BTN],
    ])
  );
};
