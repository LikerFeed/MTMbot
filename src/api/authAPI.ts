import instanse from '../axios';
import { Status, LoginParams, Profile, ProfileResponse, RegisterParams } from '../types/shared';

type APIResponse<T> =
  | { status: Status.SUCCESS; data: T }
  | { status: Status.ERROR; message: string };

class AuthAPI {
  public async login(params: LoginParams): Promise<APIResponse<Profile>> {
    try {
      const response: ProfileResponse = await instanse.post('/auth/signin', params);
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      return {
        status: Status.ERROR,
        message: err?.response?.data?.message || 'Login error',
      };
    }
  }

  public async register(params: RegisterParams): Promise<APIResponse<Profile>> {
    const { username, firstPass, email, secondPass } = params;

    if (firstPass !== secondPass) {
      return {
        status: Status.ERROR,
        message: 'Passwords do not match',
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
        message: err?.response?.data?.message || 'Registration error',
      };
    }
  }

  public async fetchAuthMe(): Promise<APIResponse<Profile>> {
    try {
      const response = await instanse.get<Profile>('/user/me');
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      return {
        status: Status.ERROR,
        message: err?.response?.data?.message || 'Fetch error',
      };
    }
  }

  public async loginWithGoogle(code: string): Promise<APIResponse<Profile>> {
    try {
      const response: ProfileResponse = await instanse.post('/auth/google', {
        code,
      });
      return { status: Status.SUCCESS, data: response.data };
    } catch (err: any) {
      return {
        status: Status.ERROR,
        message: err?.response?.data?.message || 'Google login error',
      };
    }
  }
}

const authAPI = new AuthAPI();
export default authAPI;