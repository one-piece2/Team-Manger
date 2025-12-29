import API from "./axios-client";
import type{
  loginType,
  LoginResponseType,
  registerType,
  CurrentUserResponseType,
} from "@/types/api.type";

// 登录
export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  const response = await API.post(`/auth/login`, data);
  return response.data;
};

// 注册
export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data);

// 登出
export const logoutMutationFn = async () => await API.post("/auth/logout");

// 获取当前用户
export const getCurrentUserQueryFn =
  async (): Promise<CurrentUserResponseType> => {
    const response = await API.get(`/user/current`);
    return response.data;
  };