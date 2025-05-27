import { Context as TelegrafContext } from "telegraf";

export interface SessionData {
  step?: "faq" | "task" | "signIn" | "signUp" | null;
  token?: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface BotContext extends TelegrafContext {
  session: SessionData;
}
