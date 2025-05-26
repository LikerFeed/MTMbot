import { Context as TelegrafContext } from "telegraf";

export interface SessionData {
  token?: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface BotContext extends TelegrafContext {
  session: SessionData;
}
