import { Telegraf } from "telegraf";
import { BotContext } from "../types/BotContext";
import { messagesMap, menuRoutes } from "../handlers/menus";
import { withUser } from "../utils";

const textAllowedSteps = ["LANG_BTN", "logout", "signIn", "signUp"];

export function setupMenuRoutes(bot: Telegraf<BotContext>) {
  const hears = (keys: string[], handler: (ctx: BotContext) => Promise<void>) => {
    bot.hears(keys, async (ctx) => {
      const currentText = ctx.message?.text;

      const isAllowed = textAllowedSteps.some((key) => messagesMap[key]?.includes(currentText || ""));
      if (!isAllowed) return;

      await withUser(ctx, async () => handler(ctx));
    });
  };

  menuRoutes.forEach(([key, handler]) => {
    const keys = messagesMap[key] || [];
    hears(keys, handler);
  });
}
