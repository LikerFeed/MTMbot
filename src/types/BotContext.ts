import { Context as TelegrafContext } from "telegraf";
import { Task } from "./entities/Task";

export interface SessionData {
  tasks: Task[]
  totalTaskPages: number;
  taskPage: number;
  step?: "faq" | "task" | "signIn" | "signUp" | "edit_task_title" | "edit_task_description" | "edit_task_deadline" | "edit_task_links" | null;
  token?: string;
  user?: {
    username: string;
    email: string;
  };
  activeTaskIndex: number;
}

export interface BotContext extends TelegrafContext {
  session: SessionData;
}
