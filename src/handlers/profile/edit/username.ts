import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import userTelegramAPI from "../../../api/profileTelegramApi";
import { Status } from "../../../types/shared";
import { showProfileMenu } from "../menu";

export const handleEditUsername = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const profileResult = await userTelegramAPI.getMyProfile(ctx);

  if (profileResult.status === Status.SUCCESS && profileResult.profile) {
    ctx.session.user = {
      username: profileResult.profile.username,
      email: profileResult.profile.email,
    };
  }

  const currentUsername = ctx.session.user?.username;

  ctx.session.step = "edit_username";

  await ctx.reply(
    `${t(userId, "currentUsername")}: ${currentUsername}\n${t(
      userId,
      "enterNewUsername"
    )}`
  );
};

export const handleEditUsernameText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId || !("text" in ctx.message!)) return;

  const newName = ctx.message.text.trim();
  if (!newName) return;

  const result = await userTelegramAPI.changeName(ctx, { username: newName });

  if (result.status === Status.ERROR) {
    await ctx.reply(t(userId, "usernameUpdateFail"));
    return;
  }

  ctx.session.user = {
    ...ctx.session.user!,
    username: newName,
  };

  await ctx.reply(t(userId, "usernameUpdateSuccess"));
  ctx.session.step = null;

  await showProfileMenu(ctx);
};
