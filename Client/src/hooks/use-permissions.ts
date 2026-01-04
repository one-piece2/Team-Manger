import { useEffect, useState, useMemo } from "react";
import { type PermissionType } from "@/constant";
import { type UserType, type WorkspaceWithMembersType } from "@/types/api.type";

//这是获取用户权限的hook    
export const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
): PermissionType[] => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  useEffect(() => {
    if (user && workspace && workspace.members) {
      const member = workspace.members.find(
        (member) => member.user.id === user.id
      );
      if (member) {
        setPermissions(member.role.permissions || []);
      }
    }
  }, [user, workspace]);

  return useMemo(() => permissions, [permissions]);
};