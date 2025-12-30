import type {
  PermissionType,
  TaskPriorityEnumType,
  TaskStatusEnumType,
} from "@/constant";

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


//----------------Workspace----------------
//工作空间类型
export type WorkspaceType = {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  inviteCode: string;
};
// 角色类型
export type RoleType = {
  _id: string;
  name: string;
  permissions: PermissionType[];
};




//带成员的工作空间类型
export type WorkspaceWithMembersType = WorkspaceType & {
  members: {
    _id: string;
    userId: string;
    workspaceId: string;
    role: {
      _id: string;
      name: string;
      permissions: PermissionType[];
    };
    joinedAt: string;
    createdAt: string;
  }[];
};

// 创建工作空间
export type CreateWorkspaceType = {
  name: string;
  description?: string;
};
// 创建工作空间响应类型
export type CreateWorkspaceResponseType = {
  message: string;
  workspace: WorkspaceType;
};


// 编辑工作空间
export type EditWorkspaceType = {
  workspaceId: string;
  data: {
    name: string;
    description?: string;
  };
};


// 获取所有工作空间
export type AllWorkspaceResponseType = {
  message: string;
  workspaces: WorkspaceType[];
};

// 获取单个工作空间（包含所有成员信息）
export type WorkspaceByIdResponseType = {
  message: string;
  workspace: WorkspaceWithMembersType;
};

// 分析数据
export type AnalyticsResponseType = {
  message: string;
  analytics: {
    totalTasks: number;
    overdueTasks: number;
    completedTasks: number;
  };
};

