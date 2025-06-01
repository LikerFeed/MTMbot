import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";
import profileAPI from "../../api/profileAPI";

export const showProfileMenu = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !ctx.session.token) return;

  setReturnContext(userId, showProfileMenu);

  const result = await profileAPI.getMyProfile(ctx);

  if (result.status === "error" || !result.profile) {
    await ctx.reply(t(userId, "profileLoadFailed"));
    return;
  }

  const { username, email, createdAt } = result.profile;

  await ctx.reply(
    `${t(userId, "profileInfo")}:\n\n` +
      `👤 ${t(userId, "username")}: ${username}\n` +
      `📧 ${t(userId, "email")}: ${email}\n` +
      `🕓 ${t(userId, "createdAt")}: ${new Date(createdAt).toLocaleDateString()}`,
  );

  await ctx.reply(
    t(userId, "profileMenu"),
    keyboard([
      [t(userId, "editProfile"), t(userId, "deleteProfile")],
      [t(userId, "backToMainMenu"), LANG_BTN],
    ])
  );
};