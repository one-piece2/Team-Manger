# 10 - 路由与权限系统

## 📋 概述

本文档介绍：
- React Router 路由配置
- 路由守卫实现
- RBAC 权限系统
- 布局组件

---

## 1️⃣ 路由结构

```
/                           → 登录页
/sign-up                    → 注册页
/google/callback            → Google OAuth 回调
/workspace/:workspaceId     → 工作空间首页
/workspace/:workspaceId/tasks → 任务列表
/workspace/:workspaceId/members → 成员管理
/workspace/:workspaceId/settings → 设置页面
/workspace/:workspaceId/project/:projectId → 项目详情
/invite/workspace/:inviteCode/join → 邀请加入
```

---

## 2️⃣ 路由配置

### src/routes/common/routePaths.ts

```typescript
export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  TASKS: "/workspace/:workspaceId/tasks",
  MEMBERS: "/workspace/:workspaceId/members",
  SETTINGS: "/workspace/:workspaceId/settings",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
};

export const BASE_ROUTE = {
  INVITE_URL: "/invite/workspace/:inviteCode/join",
};
```

### src/routes/common/routes.tsx

```typescript
import GoogleOAuth from "@/page/auth/GoogleOAuth";
import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import WorkspaceDashboard from "@/page/workspace/Dashboard";
import Members from "@/page/workspace/Members";
import ProjectDetails from "@/page/workspace/ProjectDetails";
import Settings from "@/page/workspace/Settings";
import Tasks from "@/page/workspace/Tasks";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";
import InviteUser from "@/page/invite/InviteUser";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuth /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: <WorkspaceDashboard /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
];
```

### src/routes/protected.route.tsx

```typescript
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/api/use-auth";
import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";

const ProtectedRoute = () => {
  const { data, isLoading } = useAuth();
  const user = data?.user;

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
```

### src/routes/auth.route.tsx

```typescript
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/hooks/api/use-auth";
import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import { isAuthRoute } from "./common/routePaths";

const AuthRoute = () => {
  const location = useLocation();
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;

  const isLoginRoute = isAuthRoute(location.pathname);

  if (isLoading && !isLoginRoute) return <DashboardSkeleton />;

  if (!user) return <Outlet />;

  return <Navigate to={`/workspace/${user?.currentWorkspace?._id}`} replace />;
};

export default AuthRoute;
```

### src/routes/index.tsx

```typescript
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./protected.route";
import AuthRoute from "./auth.route";
import {
  authenticationRoutePaths,
  baseRoutePaths,
  protectedRoutePaths,
} from "./common/routes";
import AppLayout from "@/layout/app.layout";
import BaseLayout from "@/layout/base.layout";
import NotFound from "@/page/errors/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BaseLayout />}>
          {baseRoutePaths.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="/" element={<AuthRoute />}>
          <Route element={<BaseLayout />}>
            {authenticationRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>

        {/* Protected Route */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {protectedRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
```

---

## 3️⃣ 布局组件

### src/layout/base.layout.tsx

```typescript
import { Outlet } from "react-router-dom";

const BaseLayout = () => {
  return (
    <div className="flex flex-col w-full h-auto">
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full mx-auto h-auto ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
```

### src/layout/app.layout.tsx

```typescript
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
//import { AuthProvider } from "@/context/auth-provider";
import Asidebar from "@/components/asidebar/asidebar";
import Header from "@/components/header";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
import { AuthProvider } from "@/context/auth-provider";

const AppLayout = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Asidebar />
        <SidebarInset className="overflow-x-hidden">
          <div className="w-full">
            <>
              <Header />
              <div className="px-3 lg:px-20 py-3">
                <Outlet />
              </div>
            </>
            <CreateWorkspaceDialog />
            <CreateProjectDialog />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;
```

---

## 4️⃣ 路由守卫 HOC

### src/hoc/with-permission.tsx

```typescript
import { ComponentType } from "react";
import { useAuthContext } from "@/context/auth-provider";
import { PermissionType } from "@/constant";
import { Navigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";

interface WithPermissionOptions {
  requiredPermission: PermissionType;
  redirectTo?: string;
}

function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithPermissionOptions
) {
  const { requiredPermission, redirectTo } = options;

  return function PermissionWrapper(props: P) {
    const { hasPermission, isLoading } = useAuthContext();
    const workspaceId = useWorkspaceId();

    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (!hasPermission(requiredPermission)) {
      const redirect = redirectTo || `/workspace/${workspaceId}`;
      return <Navigate to={redirect} replace />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withPermission;
```

**使用示例：**

```typescript
import withPermission from "@/hoc/with-permission";
import { Permissions } from "@/constant";

const SettingsPage = () => {
  return <div>Settings Content</div>;
};

// 需要 MANAGE_WORKSPACE_SETTINGS 权限才能访问
export default withPermission(SettingsPage, {
  requiredPermission: Permissions.MANAGE_WORKSPACE_SETTINGS,
});
```

---

## 5️⃣ RBAC 权限系统

### 权限定义

```typescript
// src/constant/index.ts
export const Permissions = {
  // 工作空间权限
  CREATE_WORKSPACE: "CREATE_WORKSPACE",
  EDIT_WORKSPACE: "EDIT_WORKSPACE",
  DELETE_WORKSPACE: "DELETE_WORKSPACE",
  MANAGE_WORKSPACE_SETTINGS: "MANAGE_WORKSPACE_SETTINGS",
  
  // 成员权限
  ADD_MEMBER: "ADD_MEMBER",
  CHANGE_MEMBER_ROLE: "CHANGE_MEMBER_ROLE",
  REMOVE_MEMBER: "REMOVE_MEMBER",
  
  // 项目权限
  CREATE_PROJECT: "CREATE_PROJECT",
  EDIT_PROJECT: "EDIT_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",
  
  // 任务权限
  CREATE_TASK: "CREATE_TASK",
  EDIT_TASK: "EDIT_TASK",
  DELETE_TASK: "DELETE_TASK",
  
  // 查看权限
  VIEW_ONLY: "VIEW_ONLY",
} as const;

export type PermissionType = (typeof Permissions)[keyof typeof Permissions];
```

### 角色权限映射（后端定义）

| 角色 | 权限 |
|------|------|
| **OWNER** | 所有权限 |
| **ADMIN** | 除 DELETE_WORKSPACE 外的所有权限 |
| **MEMBER** | CREATE_TASK, EDIT_TASK, VIEW_ONLY |
| **GUEST** | VIEW_ONLY |

---

## 6️⃣ 权限检查 Hook

### src/hooks/use-permissions.ts

```typescript
import { useAuthContext } from "@/context/auth-provider";
import { PermissionType } from "@/constant";

const usePermissions = () => {
  const { hasPermission, role } = useAuthContext();

  // 检查单个权限
  const checkPermission = (permission: PermissionType): boolean => {
    return hasPermission(permission);
  };

  // 检查多个权限（全部满足）
  const checkAllPermissions = (permissions: PermissionType[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  // 检查多个权限（满足其一）
  const checkAnyPermission = (permissions: PermissionType[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  // 检查是否是 Owner
  const isOwner = role?.name === "OWNER";

  // 检查是否是 Admin 或 Owner
  const isAdminOrOwner = role?.name === "OWNER" || role?.name === "ADMIN";

  return {
    role,
    isOwner,
    isAdminOrOwner,
    checkPermission,
    checkAllPermissions,
    checkAnyPermission,
  };
};

export default usePermissions;
```

**使用示例：**

```typescript
const { checkPermission, isOwner } = usePermissions();

// 在组件中使用
if (checkPermission(Permissions.DELETE_PROJECT)) {
  // 显示删除按钮
}

if (isOwner) {
  // 显示所有者专属功能
}
```

---

## 7️⃣ 受保护路由组件

### src/routes/common/protected-route.tsx

```typescript
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "@/store/store";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { accessToken } = useStore();
  const location = useLocation();

  if (!accessToken) {
    // 保存当前路径，登录后重定向回来
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?returnUrl=${returnUrl}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

### src/routes/common/public-route.tsx

```typescript
import { Navigate } from "react-router-dom";
import { useStore } from "@/store/store";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserQueryFn } from "@/lib/api";
import { Loader } from "lucide-react";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { accessToken } = useStore();

  const { data, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: !!accessToken,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 已登录用户重定向到工作空间
  if (data?.user) {
    return <Navigate to={`/workspace/${data.user.currentWorkspace._id}`} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
```

---

## 8️⃣ 完整路由配置（带守卫）

### src/routes/index.tsx (完整版)

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader } from "lucide-react";
import ProtectedRoute from "./common/protected-route";
import PublicRoute from "./common/public-route";

// 懒加载页面
const SignIn = lazy(() => import("@/page/auth/Sign-in"));
const SignUp = lazy(() => import("@/page/auth/Sign-up"));
const GoogleOAuth = lazy(() => import("@/page/auth/GoogleOAuth"));
const InviteUser = lazy(() => import("@/page/invite/InviteUser"));
const WorkspaceLayout = lazy(() => import("@/layout/workspace.layout"));
const Dashboard = lazy(() => import("@/page/workspace/Dashboard"));
const Tasks = lazy(() => import("@/page/workspace/Tasks"));
const Members = lazy(() => import("@/page/workspace/Members"));
const Settings = lazy(() => import("@/page/workspace/Settings"));
const ProjectDetails = lazy(() => import("@/page/workspace/ProjectDetails"));
const NotFound = lazy(() => import("@/page/errors/NotFound"));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader className="h-8 w-8 animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 公开路由 - 已登录用户会被重定向 */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/sign-up"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          
          {/* OAuth 回调 - 不需要守卫 */}
          <Route path="/google/callback" element={<GoogleOAuth />} />
          
          {/* 邀请链接 - 需要登录 */}
          <Route
            path="/invite/workspace/:inviteCode/join"
            element={
              <ProtectedRoute>
                <InviteUser />
              </ProtectedRoute>
            }
          />

          {/* 受保护的工作空间路由 */}
          <Route
            path="/workspace/:workspaceId"
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="members" element={<Members />} />
            <Route path="settings" element={<Settings />} />
            <Route path="project/:projectId" element={<ProjectDetails />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
```

---

## 9️⃣ 错误页面

### src/page/errors/NotFound.tsx

```typescript
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
```

---

## ✅ 路由权限检查清单

| 页面 | 路由 | 权限要求 |
|------|------|---------|
| 登录 | `/` | 公开 |
| 注册 | `/sign-up` | 公开 |
| 仪表盘 | `/workspace/:id` | 登录 |
| 任务 | `/workspace/:id/tasks` | 登录 |
| 成员 | `/workspace/:id/members` | 登录 |
| 设置 | `/workspace/:id/settings` | MANAGE_WORKSPACE_SETTINGS |
| 项目详情 | `/workspace/:id/project/:pid` | 登录 |

---

## 🎉 恭喜完成！

你已经完成了整个 B2B TeamSync 前端项目的学习！

### 回顾

| 文档 | 内容 |
|------|------|
| 00 | 项目概述 |
| 01 | 环境搭建 |
| 02 | 项目初始化 |
| 03 | 认证系统 |
| 04 | 状态管理 |
| 05 | 工作空间模块 |
| 06 | 项目管理模块 |
| 07 | 任务管理模块 |
| 08 | 成员管理模块 |
| 09 | UI 组件 |
| 10 | 路由与权限 |

### 下一步建议

1. **按顺序实现** - 从 01 开始，逐步完成每个模块
2. **理解代码** - 不要只是复制，理解每行代码的作用
3. **添加测试** - 为关键功能添加单元测试
4. **优化性能** - 使用 React DevTools 分析性能
5. **部署上线** - 使用 Vercel 部署你的项目

祝你实习面试顺利！🚀
