import { BotContext } from "../../../types/BotContext";
import { t } from "../../../lang";
import profileAPI from "../../../api/profileAPI";
import { Status } from "../../../types/shared";
import { showProfileMenu } from "../menu";

// Function to handle the edit password command
export const handleEditPassword = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.session.step = "edit_password_old";
  ctx.session.tempPassword = {};

  await ctx.reply(t(userId, "enterOldPassword"));
};

// Function to handle the text input for editing the password
export const handleEditPasswordText = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  if (!ctx.message || !("text" in ctx.message)) return;
  const text = ctx.message.text.trim();

  if (!userId || !text) return;

  const step = ctx.session.step;

  if (step === "edit_password_old") {
    await ctx.deleteMessage();

    ctx.session.tempPassword = { oldPassword: text };
    ctx.session.step = "edit_password_new";

    await ctx.reply(t(userId, "enterNewPassword"));
    return;
  }

  if (step === "edit_password_new") {
    await ctx.deleteMessage();
    
    const oldPassword = ctx.session.tempPassword?.oldPassword;
    const newPassword = text;

    if (!oldPassword) {
      await ctx.reply(t(userId, "passwordUpdateFail"));
      ctx.session.step = null;
      return;
    }

    const result = await profileAPI.changePassword(ctx, {
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
