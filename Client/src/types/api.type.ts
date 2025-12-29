// import {
//   PermissionType,
//   TaskPriorityEnumType,
//   TaskStatusEnumType,
// } from "@/constant";

// 登录类型
export type loginType = { email: string; password: string };

export type LoginResponseType = {
  message: string;
  access_token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    currentWorkspace: string;
  };
};

// 注册类型
export type registerType = {
  name: string;
  email: string;
  password: string;
};

// 用户类型
export type UserType = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  isActive: true;
  lastLogin: null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: {
    _id: string;
    name: string;
    owner: string;
    inviteCode: string;
  };
};

export type CurrentUserResponseType = {
  message: string;
  user: UserType;
};