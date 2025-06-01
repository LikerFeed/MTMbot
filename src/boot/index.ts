import { Telegraf, session } from "telegraf";
import dotenv from "dotenv";

import { BotContext, SessionData } from "../types/BotContext";

import { setupHeards } from "./setupHears";
import { setupTextSteps } from "./setupTextSteps";

dotenv.config();

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN!);
bot.use(
  session({
    defaultSession: (): SessionData => ({
      // User/Auth
      token: undefined,
      user: undefined,
      step: null,

      // Task data
      tasks: [],
      taskPage: 0,
      totalTaskPages: 0,
      activeTaskIndex: 0,

      // Category data
      categories: [],
      categoryPage: 0,
      totalCategoryPages: 0,
      activeCategoryIndex: 0,
    }),
  }) as any
);

setupHeards(bot);
bot.on("text", setupTextSteps);

bot.launch();
