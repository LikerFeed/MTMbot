export enum Status {
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export type Avatar = {
  url: string;
  public_id: string;
};

export type User = {
  _id: string;
  username: string;
  avatar: string;
  avatarEffect?: AvatarEffect;
};

export type ProfileEffect = {
  title: string;
  intro?: string;
  preview: string;
  sides: string;
  top?: string;
  _id: string;
};

export type AvatarEffect = {
  _id: string;
  title: string;
  preview: string;
  animated: string;
};

export type Roles = "user" | "admin";

export type Profile = {
  _id: string;
  createdAt: string;
  email: string;
  token: string;
  updatedAt: string;
  username: string;
  avatar: string;
  roles?: [Roles, Roles];
  isBanned?: boolean;
  profileEffect: ProfileEffect;
  avatarEffect: AvatarEffect;
};

export type ProfileResponse = {
  data: Profile;
  status: number;
  statusText: string;
};

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  username: string;
  firstPass: string;
  secondPass: string;
}