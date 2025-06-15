import { Context as TelegrafContext } from "telegraf";
import { Task } from "./entities/Task";
import { Category } from "./entities/Category";

export interface SessionData {
  // User/Auth
  token?: string;
  user?: {
    username: string;
    email: string;
  };
  step?:
    | "signIn"
    | "signUp"
    | "edit_username"
    | "edit_password_old"
    | "edit_password_new"

    // Task
    | "task"
    | "create_task"
    | "edit_task_title"
    | "edit_task_description"
    | "edit_task_deadline"
    | "edit_task_links"
    | "edit_task_categories"
    | "sort_tasks"

    // Category
    | "category"
    | "create_category_title"
    | "edit_category_title"
    | "delete_category_confirm"

    // FAQ
    | "faq"
    | null;

  // Task data
  tasks: Task[];
  taskPage: number;
  totalTaskPages: number;
  activeTaskIndex: number;
  tempTask?: {
    title?: string;
    description?: string;
  };
  sortOption?: "deadline" | "status" | "createdAt" | "updatedAt" | null;

  // Category data
  categories?: Category[];
  categoryPage?: number;
  totalCategoryPages?: number;
  activeCategoryIndex: number;

  // Temp password storage
  tempPassword?: {
    oldPassword?: string;
  };
}

export interface BotContext extends TelegrafContext {
  session: SessionData;
}
