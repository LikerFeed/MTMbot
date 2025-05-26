import { BotContext } from "../../../types/BotContext";
import authAPI from "../../../api/authAPI";

import { menus } from "../../menus";
import { isValidEmail, isValidUsername, isValidPassword } from "../validators";
import { t, setReturnContext } from "../../../lang";

type Session = {
  step: "email" | "username" | "password" | "confirm";
  email?: string;
  username?: string;
  password?: string;
};

const signUpSessions = new Map<number, Session>();

export const startSignUp = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  signUpSessions.set(userId, { step: "email" });
  await ctx.reply(t(userId, "enterEmail"));
};

export const handleSignUp = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const message =
    ctx.message && "text" in ctx.message ? ctx.message.text.trim() : "";
  if (!userId || !message) return;

  const session = signUpSessions.get(userId);
  if (!session) return;

  if (session.step === "email") {
    if (!isValidEmail(message)) {
      await ctx.reply(t(userId, "invalidEmail"));
      return;
    }

    signUpSessions.set(userId, {
      ...session,
      step: "username",
      email: message,
    });
    await ctx.reply(t(userId, "enterUsername"));
    return;
  }

  if (session.step === "username") {
    if (!isValidUsername(message)) {
      await ctx.reply(t(userId, "invalidUsername"));
      return;
    }

    signUpSessions.set(userId, {
      ...session,
      step: "password",
      username: message,
    });
    await ctx.reply(t(userId, "enterPassword"));
    return;
  }

  if (session.step === "password") {
    await ctx.deleteMessage();
    
    if (!isValidPassword(message)) {
      await ctx.reply(t(userId, "invalidPassword"));
      return;
    }

    signUpSessions.set(userId, {
      ...session,
      step: "confirm",
      password: message,
    });
    await ctx.reply(t(userId, "repeatPassword"));
    return;
  }

  if (session.step === "confirm") {
    await ctx.deleteMessage();

    if (message !== session.password) {
      await ctx.reply(t(userId, "passwordMismatch"));
      return;
    }

    const { email, username, password } = session;
    const result = await authAPI.register(userId, {
      email: email!,
      username: username!,
      firstPass: password!,
      secondPass: message,
    });

    if (result.status === "error") {
      await ctx.reply(`${t(userId, "signUpFailed")}: ${result.error}`);
      return;
    }

    ctx.session.token = result.data.token;
    ctx.session.user = {
      username: result.data.username,
      email: result.data.email,
    };

    signUpSessions.delete(userId);
    setReturnContext(userId, async (ctx) => menus.showMainMenu(ctx));
    await ctx.reply(t(userId, "successSignUp"));
    await menus.showMainMenu(ctx);
  }
};
