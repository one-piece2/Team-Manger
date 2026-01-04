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



//-----------------------项目----------------
// 项目类型
export type ProjectType = {
  _id: string;
  name: string;
  emoji: string;
  description: string;
  workspace: string;
  createdBy: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  createdAt: string;
  updatedAt: string;
};

// 创建项目
export type CreateProjectPayloadType = {
  workspaceId: string;
  data: {
    emoji: string;
    name: string;
    description?: string;
  };
};
// 项目响应
export type ProjectResponseType = {
  message: "Project created successfully";
  project: ProjectType;
};

// 编辑项目
export type EditProjectPayloadType = {
  workspaceId: string;
  projectId: string;
  data: {
  emoji: string;
    name: string;
    description: string;
  };
};



//所有项目
export type AllProjectPayloadType = {
  workspaceId: string;
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  //是否跳过
  skip?: boolean;
};

export type AllProjectResponseType = {
  message: string;
  projects: ProjectType[];
  pagination: PaginationType;
};

// 按 ID 获取项目
export type ProjectByIdPayloadType = {
  workspaceId: string;
  projectId: string;
};

// 分页类型
export type PaginationType = {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  skip: number;
  limit: number;
};

//--------------------任务---------------
// 创建任务
export type CreateTaskPayloadType = {
  workspaceId: string;
  projectId: string;
  data: {
    title: string;
    description: string;
    priority: TaskPriorityEnumType;
    status: TaskStatusEnumType;
    assignedTo: string;
    dueDate: string;
  };
};

// 编辑任务
export type EditTaskPayloadType = {
  taskId: string;
  workspaceId: string;
  projectId: string;
  data: Partial<{
    title: string;
    description: string;
    priority: TaskPriorityEnumType;
    status: TaskStatusEnumType;
    assignedTo: string;
    dueDate: string;
  }>;
};

// 获取所有任务
export type AllTaskPayloadType = {
  workspaceId: string;
  projectId?: string | null;
  keyword?: string | null;
  priority?: TaskPriorityEnumType | null;
  status?: TaskStatusEnumType | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  pageNumber?: number | null;
  pageSize?: number | null;
};

// 任务类型
export type TaskType = {
  _id: string;
  title: string;
  description?: string;
  project?: {
    _id: string;
    emoji: string;
    name: string;
  };
  priority: TaskPriorityEnumType;
  status: TaskStatusEnumType;
  assignedTo: {
    _id: string;
    name: string;
    profilePicture: string | null;
  } | null;
  createdBy?: string;
  dueDate: string;
  taskCode: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AllTaskResponseType = {
  message: string;
  tasks: TaskType[];
  pagination: PaginationType;
};



//-------------成员----------------
export type MemberType = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
  workspaceId: string;
  role: {
    _id: string;
    name: string;
  };
  joinedAt: Date;
};

// 获取所有成员响应
export type AllMembersInWorkspaceResponseType = {
  message: string;
  members: MemberType[];
  roles: RoleType[];
};

// 修改成员角色
export type ChangeWorkspaceMemberRoleType = {
  workspaceId: string;
  data: {
    memberId: string;
    roleId: string;
  };
};