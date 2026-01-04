import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/hooks/api/use-auth";
import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import { isAuthRoute } from "./common/routePaths";

const AuthRoute = () => {
  const location = useLocation();
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;

  //判断是否是登录路由
  const isLoginRoute = isAuthRoute(location.pathname);
   
  if (isLoading && !isLoginRoute) return <DashboardSkeleton />;
//如果用户没有登录 则渲染登录页面
  if (!user) return <Outlet />;
//如果用户登录了 则重定向到工作区页面
  return <Navigate to={`/workspace/${user?.currentWorkspace.id}`} replace />;
};

export default AuthRoute;