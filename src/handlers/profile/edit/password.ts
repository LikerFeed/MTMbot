import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import userTelegramAPI from "../../../api/profileTelegramApi";
import { Status } from "../../../types/shared";
import { showProfileMenu } from "../menu";

export const handleEditPassword = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "edit_password_old";
  ctx.session.tempPassword = {};

  await ctx.reply(t(userId, "enterOldPassword"));
};

export const handleEditPasswordText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!ctx.message || !("text" in ctx.message)) return;
  const text = ctx.message.text.trim();

  if (!userId || !text) return;

  const step = ctx.session.step;

  if (step === "edit_password_old") {
    ctx.session.tempPassword = { oldPassword: text };
    ctx.session.step = "edit_password_new";

    await ctx.reply(t(userId, "enterNewPassword"));
    return;
  }

  if (step === "edit_password_new") {
    const oldPassword = ctx.session.tempPassword?.oldPassword;
    const newPassword = text;

    if (!oldPassword) {
      await ctx.reply(t(userId, "passwordUpdateFail"));
      ctx.session.step = null;
      return;
    }

    const result = await userTelegramAPI.changePassword(ctx, {
      oldPassword,
      newPassword,
    });

    if (result.status === Status.ERROR) {
      await ctx.reply(t(userId, "passwordUpdateFail"));
    } else {
      await ctx.reply(t(userId, "passwordUpdateSuccess"));
    }

    ctx.session.step = null;
    ctx.session.tempPassword = undefined;

    await showProfileMenu(ctx);
  }
};
