import { Markup } from "telegraf";
import { BotContext } from "./types/BotContext";

export const getUserId = (ctx: BotContext): number => ctx.from?.id ?? -1;
export const isValidUser = (id: number) => id > 0;

export const withUser = async (
  ctx: BotContext,
  fn: (userId: number) => Promise<void>
) => {
  const userId = getUserId(ctx);
  if (isValidUser(userId)) await fn(userId);
};

export const keyboard = (
  buttons: string[][],
  opts: { oneTime?: boolean } = {}
) =>
  Markup.keyboard(buttons)
    .resize()
    .oneTime(opts.oneTime ?? true);
