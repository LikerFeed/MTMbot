import instanse from '../axios';
import { Status, LoginParams, Profile, ProfileResponse, RegisterParams } from '../types/shared';

import { t } from '../lang';

type APIResponse<T> =
  | { status: Status.SUCCESS; data: T }
  | {
    error: any; status: Status.ERROR; message: string 
};

class AuthAPI {
  public async login(userId: number, params: LoginParams): Promise<APIResponse<Profile>> {
    try {
      const response: ProfileResponse = await instanse.post('/auth/signin', params);
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      return {
        status: Status.ERROR,
        message: err?.response?.data?.message || t(userId, 'loginError'),
        error: err?.response?.data?.message || t(userId, 'loginError'),
      };
    }
  }

  public async register(userId: number, params: RegisterParams): Promise<APIResponse<Profile>> {
    const { username, firstPass, email, secondPass } = params;

    if (firstPass !== secondPass) {
      return {
        status: Status.ERROR,
        message: t(userId, 'passwordMismatch'),
        error: t(userId, 'passwordMismatch'),
      };
    }

    try {
      const response: ProfileResponse = await instanse.post('/auth/signup', {
        username,
        password: firstPass,
        email,
      });
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      return {
        status: Status.ERROR,
        message: err?.response?.data?.message || t(userId, 'registerError'),
        error: err?.response?.data?.message || t(userId, 'registerError'),
      };
    }
  }

  public async fetchAuthMe(userId: number): Promise<APIResponse<Profile>> {
    try {
      const response = await instanse.get<Profile>('/user/me');
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      return {
        status: Status.ERROR,
        message: err?.response?.data?.message || (t(userId, 'fetchError')),
        error: err?.response?.data?.message || (t(userId, 'fetchError')),
      };
    }
  }
}

const authAPI = new AuthAPI();
export default authAPI;