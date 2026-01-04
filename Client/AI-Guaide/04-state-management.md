# 04 - 状态管理配置

## 📋 概述

本项目使用三层状态管理架构：

| 层级 | 工具 | 用途 |
|------|------|------|
| **服务端状态** | TanStack Query | API 数据缓存、自动重新获取 |
| **客户端状态** | Zustand | Token、UI 状态 |
| **URL 状态** | nuqs | 筛选条件、分页参数 |

---

## 1️⃣ TanStack Query 配置

### src/context/query-provider.tsx

```typescript
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  children: ReactNode;
}

export default function QueryProvider({ children }: Props) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (failureCount < 2 && error?.message === "Network Error") {
            return true;
          }
          return false;
        },
        retryDelay: 0,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### 使用示例

```typescript
// 查询数据
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["workspace", workspaceId],
  queryFn: () => getWorkspaceByIdQueryFn(workspaceId),
  enabled: !!workspaceId, // 条件查询
});

// 修改数据
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const { mutate, isPending } = useMutation({
  mutationFn: createTaskMutationFn,
  onSuccess: () => {
    // 使缓存失效，触发重新获取
    queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
  },
});
```

---

## 2️⃣ Zustand Store 完整配置

### src/store/store.ts

```typescript
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";
import createSelectors from "./selectors";

type UserType = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  currentWorkspace: string;
};

type AuthState = {
  accessToken: string | null;
  user: UserType | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  setUser: (user: UserType) => void;
  clearUser: () => void;
};

const createAuthSlice: StateCreator<AuthState> = (set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

type StoreType = AuthState;

export const useStoreBase = create<StoreType>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createAuthSlice(...a),
      })),
      {
        name: "session-storage",
        getStorage: () => sessionStorage,
      }
    )
  )
);

export const useStore = createSelectors(useStoreBase);
```

### src/store/selectors.ts

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoreApi, UseBoundStore } from "zustand";

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

export default createSelectors;
```

---

## 3️⃣ 认证 Context

### src/context/auth-provider.tsx

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect } from "react";
import useAuth from "@/hooks/api/use-auth";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceQuery from "@/hooks/api/use-get-workspace";
import { useNavigate } from "react-router-dom";
import { UserType, WorkspaceType } from "@/types/api.type";
import { PermissionType } from "@/constant";
import { usePermissions } from "@/hooks/use-permissions";

// Define the context shape
type AuthContextType = {
  user?: UserType;
  workspace?: WorkspaceType;
  hasPermission: (permission: PermissionType) => boolean;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  refetchAuth: () => void;
  refetchWorkspace: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();

  const {
    data: authData,
    error: authError,
    isLoading: authLoading,
    isFetching,
    refetch: refetchAuth,
  } = useAuth();
  const user = authData?.user;

  // Fetch workspace
  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    //isSuccess: workspaceSuccess,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceQuery(workspaceId);

  const workspace = workspaceData?.workspace;

  useEffect(() => {
    if (workspaceError) {
      const errorCode = workspaceError?.errorCode;
      if (
        errorCode === "RESOURCE_NOT_FOUND" ||
        errorCode === "ACCESS_UNAUTHORIZED"
      ) {
        navigate("/"); // Redirect if the user is not a member of the workspace
      }
    }
  }, [navigate, workspaceError]);

  const permissions = usePermissions(user, workspace);

  const hasPermission = (permission: PermissionType): boolean => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace: workspaceData?.workspace,
        hasPermission,
        error: authError || workspaceError,
        isLoading: authLoading || workspaceLoading,
        isFetching,
        refetchAuth,
        refetchWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUserContext must be used within a AuthProvider");
  }
  return context;
};
```

### src/hooks/api/use-auth.tsx

```typescript
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserQueryFn } from "@/lib/api";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    //staleTime: Infinity,
    staleTime: 0,
    retry: 2,
  });
  return query;
};

export default useAuth;
```

### src/hooks/api/use-get-workspace.tsx

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceByIdQueryFn } from "@/lib/api";
import { CustomError } from "@/types/custom-error.type";

const useGetWorkspaceQuery = (workspaceId: string) => {
  const query = useQuery<any, CustomError>({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceByIdQueryFn(workspaceId),
    staleTime: 0,
    retry: 2,
    enabled: !!workspaceId,
  });

  return query;
};

export default useGetWorkspaceQuery;
```

---

## 4️⃣ 常量定义

### src/constant/index.ts

```typescript
export const TaskStatusEnum = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;

export const TaskPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;
export type TaskStatusEnumType = keyof typeof TaskStatusEnum;
export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;

export const Permissions = {
  CREATE_WORKSPACE: "CREATE_WORKSPACE",
  DELETE_WORKSPACE: "DELETE_WORKSPACE",
  EDIT_WORKSPACE: "EDIT_WORKSPACE",
  MANAGE_WORKSPACE_SETTINGS: "MANAGE_WORKSPACE_SETTINGS",
  ADD_MEMBER: "ADD_MEMBER",
  CHANGE_MEMBER_ROLE: "CHANGE_MEMBER_ROLE",
  REMOVE_MEMBER: "REMOVE_MEMBER",
  CREATE_PROJECT: "CREATE_PROJECT",
  EDIT_PROJECT: "EDIT_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",
  CREATE_TASK: "CREATE_TASK",
  EDIT_TASK: "EDIT_TASK",
  DELETE_TASK: "DELETE_TASK",
  VIEW_ONLY: "VIEW_ONLY",
} as const;

export type PermissionType = keyof typeof Permissions;
```

---

## 5️⃣ 自定义 Hooks

### src/hooks/use-workspace-id.ts

```typescript
import { useParams } from "react-router-dom";

const useWorkspaceId = () => {
  const params = useParams<{ workspaceId: string }>();
  return params.workspaceId as string;
};

export default useWorkspaceId;
```

### src/hooks/use-permissions.ts

```typescript
import { useEffect, useState, useMemo } from "react";
import { PermissionType } from "@/constant";
import { UserType, WorkspaceWithMembersType } from "@/types/api.type";

export const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
): PermissionType[] => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  useEffect(() => {
    if (user && workspace) {
      const member = workspace.members.find(
        (member: { userId: string }) => member.userId === user._id
      );
      if (member) {
        setPermissions(member.role.permissions || []);
      }
    }
  }, [user, workspace]);

  return useMemo(() => permissions, [permissions]);
};
```

### src/hooks/use-confirm-dialog.tsx

```typescript
import { useState, useCallback } from "react";

interface UseConfirmDialogReturn<T> {
  open: boolean;
  context: T | null;
  onOpenDialog: (data: T) => void;
  onCloseDialog: () => void;
}

const useConfirmDialog = <T,>(): UseConfirmDialogReturn<T> => {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<T | null>(null);

  const onOpenDialog = useCallback((data: T) => {
    setContext(data);
    setOpen(true);
  }, []);

  const onCloseDialog = useCallback(() => {
    setOpen(false);
    setContext(null);
  }, []);

  return { open, context, onOpenDialog, onCloseDialog };
};

export default useConfirmDialog;
```

### src/hooks/use-create-workspace-dialog.tsx

```typescript
import { create } from "zustand";

interface CreateWorkspaceDialogState {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useCreateWorkspaceDialog = create<CreateWorkspaceDialogState>((set) => ({
  open: false,
  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
}));

export default useCreateWorkspaceDialog;
```

### src/hooks/use-create-project-dialog.tsx

```typescript
import { create } from "zustand";

interface CreateProjectDialogState {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useCreateProjectDialog = create<CreateProjectDialogState>((set) => ({
  open: false,
  onOpen: () => set({ open: true }),
  onClose: () => set({ open: false }),
}));

export default useCreateProjectDialog;
```

---

## 6️⃣ URL 状态管理 (nuqs)

### src/hooks/use-task-table-filter.ts

```typescript
import { parseAsString, useQueryStates } from "nuqs";

const useTaskTableFilter = () => {
  const [filters, setFilters] = useQueryStates({
    status: parseAsString.withDefault(""),
    priority: parseAsString.withDefault(""),
    assignedTo: parseAsString.withDefault(""),
    keyword: parseAsString.withDefault(""),
    projectId: parseAsString.withDefault(""),
  });

  return { filters, setFilters };
};

export default useTaskTableFilter;
```

---

## 🎯 状态管理最佳实践

### 何时使用哪种状态管理？

| 场景 | 推荐工具 |
|------|---------|
| API 数据 | TanStack Query |
| 用户认证 Token | Zustand (持久化) |
| UI 状态 (弹窗开关) | Zustand |
| 表单数据 | React Hook Form |
| URL 参数 (筛选/分页) | nuqs |
| 组件内部状态 | useState |

### 面试话术

> "我使用 TanStack Query 管理所有服务端状态，利用其自动缓存和重新验证机制减少不必要的 API 请求。同时用 Zustand 管理少量客户端状态如认证 Token，避免 Context 的性能问题。URL 状态使用 nuqs 同步，支持分享链接和刷新保留筛选条件。"

---

## ➡️ 下一步

继续阅读 `05-workspace-module.md` 实现工作空间模块。
