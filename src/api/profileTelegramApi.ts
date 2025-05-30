import { BotContext } from "../types/BotContext";
import { telegramRequest } from "./telegramRequest";
import { Profile, ProfileResponse } from "../types/shared";
import { Status } from "../types/shared";

export type ProfileResult = {
  profile: Profile | null;
  status: Status;
  message?: string;
};

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export type ChangePasswordResponse = {
  message: string;
};

export type UpdateProfileResponse = {
  data: Profile;
  status: number;
  statusText: string;
};

export interface ChangeName {
  username: string;
  userId: string;
}

export interface ChangeNameParams {
  username: string;
}

export type DeleteAccountResponse = {
  message: string;
};

class UserTelegramAPI {
  public async getMyProfile(ctx: BotContext): Promise<ProfileResult> {
    try {
      const response = await telegramRequest<ProfileResponse>(ctx, {
        method: "GET",
        url: "/user/me",
      });

      return {
        profile: response as unknown as Profile,
        status: Status.SUCCESS,
      };
    } catch (err: any) {
      return {
        profile: null,
        status: Status.ERROR,
        message: err?.response?.data?.message || "Error",
      };
    }
  }

  public async changeName(
    ctx: BotContext,
    params: ChangeNameParams
  ): Promise<ProfileResult> {
    try {
      const response = await telegramRequest<ProfileResponse>(ctx, {
        method: "PATCH",
        url: "/user",
        data: {
          username: params.username,
        },
      });

      return {
        profile: response as unknown as Profile,
        status: Status.SUCCESS,
      };
    } catch (err: any) {
      return {
        profile: null,
        status: Status.ERROR,
        message: err?.response?.data?.message || "Error",
      };
    }
  }

  public async changePassword(
    ctx: BotContext,
    params: ChangePasswordParams
  ): Promise<{
    message: string | null;
    status: Status;
    error?: string;
  }> {
    try {
      const response = await telegramRequest<ChangePasswordResponse>(ctx, {
        method: "POST",
        url: "/user/password",
        data: params,
      });

      return {
        message: response.message,
        status: Status.SUCCESS,
      };
    } catch (err: any) {
      return {
        message: null,
        status: Status.ERROR,
        error: err?.response?.data?.message || "Error",
      };
    }
  }

  public async deleteAccount(ctx: BotContext): Promise<{
    status: Status;
    error?: string;
  }> {
    try {
      await telegramRequest<DeleteAccountResponse>(ctx, {
        method: "DELETE",
        url: "/user",
      });

      return { status: Status.SUCCESS };
    } catch (err: any) {
      return {
        status: Status.ERROR,
        error: err?.response?.data?.message || "Error",
      };
    }
  }
}

const userTelegramAPI = new UserTelegramAPI();
export default userTelegramAPI;
