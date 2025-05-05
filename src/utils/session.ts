import { Context } from 'telegraf';

export const getUserId = (ctx: Context): number => ctx.from?.id ?? -1;
export const isValidUser = (id: number) => id > 0;

export const withUser = async (ctx: Context, fn: (userId: number) => Promise<void>) => {
  const userId = getUserId(ctx);
  if (isValidUser(userId)) await fn(userId);
};
