

//是否属于认证路由
export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};
//认证路由
export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
};

//受保护的路由
export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  TASKS: "/workspace/:workspaceId/tasks",
  MEMBERS: "/workspace/:workspaceId/members",
  SETTINGS: "/workspace/:workspaceId/settings",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
};

//邀请路由
export const BASE_ROUTE = {
  INVITE_URL: "/invite/workspace/:inviteCode/join",
};