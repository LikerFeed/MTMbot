import { Context as TelegrafContext } from "telegraf";
import { Task } from "./entities/Task";
import { Category } from "./entities/Category";

export interface SessionData {
  activeCategoryIndex: number;
  tasks: Task[];
  totalTaskPages: number;
  taskPage: number;
  step?:
    | "faq"
    | "task"
    | "category"
    | "signIn"
    | "signUp"
    | "create_task_title"
    | "create_task_description"
    | "edit_task_title"
    | "edit_task_description"
    | "edit_task_deadline"
    | "edit_task_links"
    | "edit_username"
    | "edit_password_old"
    | "edit_password_new"
    | null;
  token?: string;
  user?: {
    username: string;
    email: string;
  };
  tempTask?: {
    title?: string;
    description?: string;
  };
  tempPassword?: {
    oldPassword?: string;
  };
  activeTaskIndex: number;
  categories?: Category[];
  categoryPage?: number;
  totalCategoryPages?: number;
}

export interface BotContext extends TelegrafContext {
  session: SessionData;
}
