import { BotContext } from "../../types/BotContext";
import { keyboard } from "../../utils";
import { t, LANG_BTN, setReturnContext } from "../../lang";
import profileAPI from "../../api/profileAPI";

// Function to show the profile menu
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

  await ctx.replyWithHTML(
    `<b>${t(userId, "profileInfo")}:</b>\n\n` +
      `<b>${t(userId, "username")}:</b> ${username}\n` +
      `<b>${t(userId, "email")}:</b> ${email}\n` +
      `<b>${t(userId, "createdAt")}:</b> ${new Date(
        createdAt
      ).toLocaleDateString()}`,
    keyboard([
      [t(userId, "editProfile"), t(userId, "deleteProfile")],
      [t(userId, "backToMainMenu"), LANG_BTN],
    ])
  );
};
