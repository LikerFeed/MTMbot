import { Context as TelegrafContext } from "telegraf";
import { Task } from "./entities/Task";

export interface SessionData {
  tasks: Task[]
  totalTaskPages: number;
  taskPage: number;
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
