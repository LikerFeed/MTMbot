import authAPI from "../../../api/authAPI";
import { menus } from "../../menus";
import { isValidEmail, isValidPassword } from "../validators";
import { t, setReturnContext } from "../../../lang";
import { BotContext } from "../../../types/BotContext";

type Session = { step: "email" | "password"; email?: string };
const authSessions = new Map<number, Session>();

export const startSignIn = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  authSessions.set(userId, { step: "email" });
  await ctx.reply(t(userId, "enterEmail"));
};

export const handleSignIn = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  const message = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  if (!userId || !message) return;

  const session = authSessions.get(userId);
  if (!session) return;

  if (session.step === "email") {
    if (!isValidEmail(message)) {
      await ctx.reply(t(userId, "invalidEmail"));
      return;
    }

    authSessions.set(userId, { step: "password", email: message });
    await ctx.reply(t(userId, "enterPassword"));
    return;
  }

  if (session.step === "password") {
    if (!isValidPassword(message)) {
      await ctx.reply(t(userId, "invalidPassword"));
      return;
    }

    const email = session.email!;
    const password = message;

    const result = await authAPI.login(userId, {
      email,
      password,
    });

    if (result.status === "error") {
      await ctx.reply(`${t(userId, "signInFailed")}: ${result.error}`);
      return;
    }

    ctx.session.token = result.data.token;
    ctx.session.user = {
      username: result.data.username,
      email: result.data.email,
    };

    authSessions.delete(userId);
    setReturnContext(userId, async (ctx) => menus.showMainMenu(ctx));
    await ctx.reply(t(userId, "successSignIn"));
    await menus.showMainMenu(ctx);
  }
};