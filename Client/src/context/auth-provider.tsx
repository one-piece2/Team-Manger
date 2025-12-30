import { createContext, useContext, useEffect } from "react";
import useAuth from "@/hooks/api/use-auth";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceQuery from "@/hooks/api/use-get-workspace";
import { useNavigate } from "react-router-dom";
import type  { UserType, WorkspaceType } from "@/types/api.type";
import { type PermissionType } from "@/constant";
import { usePermissions } from "@/hooks/use-permissions";

//context的类型
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
  //从url中获取workspaceId
  const workspaceId = useWorkspaceId();

  const {
    data: authData,
    error: authError,
    isLoading: authLoading,
    //是否正在获取数据
    isFetching,
    //重新获取用户信息
    refetch: refetchAuth,
  } = useAuth();
  const user = authData?.user;

  // 获取workspace
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
        //在useGetWorkspaceQuery中自定义了错误的类型
      const errorCode = workspaceError?.errorCode;
      if (
        errorCode === "RESOURCE_NOT_FOUND" ||
        errorCode === "ACCESS_UNAUTHORIZED"
      ) {
        navigate("/"); 
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


export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUserContext must be used within a AuthProvider");
  }
  return context;
};