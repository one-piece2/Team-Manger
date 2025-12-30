import API from "./axios-client";
import type{
  loginType,
  LoginResponseType,
  registerType,
  CurrentUserResponseType,
  WorkspaceByIdResponseType,
    CreateWorkspaceType,
  CreateWorkspaceResponseType,
  AllWorkspaceResponseType,
  EditWorkspaceType,
  AnalyticsResponseType,
  CreateProjectPayloadType,
  EditProjectPayloadType,
  AllProjectPayloadType,
  AllProjectResponseType,
  ProjectByIdPayloadType,
  ProjectResponseType,

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



  //--------------WORKSPACE----------------
  //通过workspaceId获取工作空间
  export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

// 创建工作空间
export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data);
  return response.data;
};


// 编辑工作空间
export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

// 获取用户所有工作空间
export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`);
    return response.data;
  };

// 获取工作空间分析数据
export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

// 删除工作空间
export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{ message: string; currentWorkspace: string }> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};


//--------------PROJECT----------------
// 创建项目
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.post(`/project/workspace/${workspaceId}/create`, data);
  return response.data;
};

// 编辑项目
export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.put(
    `/project/${projectId}/workspace/${workspaceId}/update`,
    data
  );
  return response.data;
};

// 获取工作空间所有项目
export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`
  );
  return response.data;
};

// 获取单个项目
export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(`/project/${projectId}/workspace/${workspaceId}`);
  return response.data;
};

// 获取项目分析数据
export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}/analytics`
  );
  return response.data;
};

// 删除项目
export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{ message: string }> => {
  const response = await API.delete(
    `/project/${projectId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};