import instance from "../axios";
import {
  Status,
  LoginParams,
  Profile,
  ProfileResponse,
  RegisterParams,
} from "../types/shared";
import { t } from "../lang";

type APIResponse<T> =
  | { status: Status.SUCCESS; data: T }
  | { status: Status.ERROR; message: string; error: any };

class AuthAPI {
  // Sign up a new user
  public async register(
    userId: number,
    params: RegisterParams
  ): Promise<APIResponse<Profile>> {
    const { username, firstPass, secondPass, email } = params;

    if (firstPass !== secondPass) {
      const message = t(userId, "passwordMismatch");
      return { status: Status.ERROR, message, error: message };
    }

    try {
      const response: ProfileResponse = await instance.post("/auth/signup", {
        username,
        password: firstPass,
        email,
      });
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || t(userId, "registerError");
      return { status: Status.ERROR, message, error: message };
    }
  }

  // Fetch authenticated user profile
  public async fetchAuthMe(userId: number): Promise<APIResponse<Profile>> {
    try {
      const response = await instance.get<Profile>("/user/me");
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      const message = err?.response?.data?.message || t(userId, "fetchError");
      return { status: Status.ERROR, message, error: message };
    }
  }

  // Sign in an existing user
  public async login(
    userId: number,
    params: LoginParams
  ): Promise<APIResponse<Profile>> {
    try {
      const response: ProfileResponse = await instance.post(
        "/auth/signin",
        params
      );
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      const message = err?.response?.data?.message || t(userId, "loginError");
      return { status: Status.ERROR, message, error: message };
    }
  }
}

const authAPI = new AuthAPI();
export default authAPI;
