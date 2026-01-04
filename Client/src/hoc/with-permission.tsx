
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { type PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";


const withPermission = (
  WrappedComponent: React.ComponentType,
  requiredPermission: PermissionType
) => {
  const WithPermission = (props: any) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    useEffect(() => {
      if (!user || !hasPermission(requiredPermission)) {
     
        //如果用户没有权限 重定向到工作区页面
        navigate(`/workspace/${workspaceId}`);
      }
    }, [user, hasPermission, navigate, workspaceId]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

   
    //如果用户没有权限 或者用户没有登录 则不渲染组件
    if (!user || !hasPermission(requiredPermission)) {
      return;
    }
   
    //如果用户有权限 则渲染组件
    return <WrappedComponent {...props} />;
  };

  return WithPermission;
};

export default withPermission;
