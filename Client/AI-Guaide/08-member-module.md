# 08 - 成员管理模块

## 📋 概述

成员管理模块包括：
- 成员列表展示
- 邀请成员
- 修改成员角色
- 移除成员
- 邀请链接处理

---

## 1️⃣ 类型定义

### src/types/api.type.ts (成员部分)

```typescript
// 成员类型
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
```

---

## 2️⃣ API 函数

### src/lib/api.ts (成员部分)

```typescript
import API from "./axios-client";
import {
  AllMembersInWorkspaceResponseType,
  ChangeWorkspaceMemberRoleType,
} from "@/types/api.type";

// 获取工作空间成员
export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`);
  return response.data;
};

// 修改成员角色
export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `/workspace/change/member/role/${workspaceId}`,
    data
  );
  return response.data;
};

// 邀请用户加入工作空间
export const invitedUserJoinWorkspaceMutationFn = async (
  inviteCode: string
): Promise<{ message: string; workspaceId: string }> => {
  const response = await API.post(`/member/workspace/${inviteCode}/join`);
  return response.data;
};
```

---

## 3️⃣ API Hook

### src/hooks/api/use-get-workspace-members.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { getMembersInWorkspaceQueryFn } from "@/lib/api";
import { CustomError } from "@/types/custom-error.type";
import { AllMembersInWorkspaceResponseType } from "@/types/api.type";

const useGetWorkspaceMembers = (workspaceId: string) => {
  const query = useQuery<AllMembersInWorkspaceResponseType, CustomError>({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    staleTime: Infinity,
    enabled: !!workspaceId,
  });
  return query;
};

export default useGetWorkspaceMembers;
```

---

## 4️⃣ 成员列表组件

### src/components/workspace/member/all-members.tsx

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useWorkspaceMembers from "@/hooks/api/use-workspace-members";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { changeWorkspaceMemberRoleMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const AllMembers = () => {
  const { hasPermission, user } = useAuthContext();
  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);

  const queryClient = useQueryClient();

  const workspaceId = useWorkspaceId();
  const { data, isPending } = useWorkspaceMembers(workspaceId);

  const members = data?.members || [];
  const roles = data?.roles || [];

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members", workspaceId],
        });
        toast({
          title: "Success",
          description: "Member's role changed successfully",
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="grid gap-6 pt-2">
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}
      {members?.map((member) => {
        const name = member.userId?.name;
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);

        return (
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={member.userId?.profilePicture || ""}
                  alt="Image"
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.userId.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      isLoading ||
                      !canChangeMemberRole ||
                      member.userId._id === user?._id
                    }
                    className="ml-auto min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none"
                  >
                    {member.role.name?.toLowerCase()}{" "}
                    {canChangeMemberRole && member.userId._id !== user?._id && (
                      <ChevronDown className="text-muted-foreground" />
                    )}
                  </Button>
                </PopoverTrigger>
                {canChangeMemberRole && (
                  <PopoverContent className="p-0" align="end">
                    <Command>
                      <CommandInput
                        disabled={isLoading}
                        className="disabled:pointer-events-none"
                        placeholder="Select new role..."
                      />
                      <CommandList>
                        {isLoading ? (
                          <Loader className="w-8 h-8 animate-spin place-self-center flex my-4" />
                        ) : (
                          <>
                            <CommandEmpty>No roles found.</CommandEmpty>
                            <CommandGroup>
                              {roles?.map(
                                (role) =>
                                  role.name !== "OWNER" &&
                                  role.name !== "GUEST" && (
                                    <CommandItem
                                      disabled={isLoading}
                                      key={role._id}
                                      onSelect={() => {
                                        handleSelect(
                                          role._id,
                                          member.userId._id
                                        );
                                      }}
                                      className="disabled:pointer-events-none gap-1 mb-1 flex flex-col items-start px-4 py-1 cursor-pointer"
                                    >
                                      <p className="capitalize">
                                        {role.name?.toLowerCase()}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {role.name === "ADMIN" &&
                                          `Can view, create, edit tasks, project and manage settings .`}

                                        {role.name === "MEMBER" &&
                                          `Can view,edit only task created by.`}
                                      </p>
                                    </CommandItem>
                                  )
                              )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllMembers;
```

---

## 5️⃣ 邀请成员组件

### src/components/workspace/member/invite-member.tsx

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useAuthContext } from "@/context/auth-provider";
import { toast } from "@/hooks/use-toast";

const InviteMember = () => {
  const { workspace } = useAuthContext();
  const [copied, setCopied] = useState(false);

  const inviteLink = workspace
    ? `${window.location.origin}/invite/workspace/${workspace.inviteCode}/join`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Members</CardTitle>
        <CardDescription>
          Share this link with people you want to invite to this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Input value={inviteLink} readOnly className="flex-1" />
          <Button onClick={handleCopy} variant="outline" size="icon">
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteMember;
```

---

## 6️⃣ 最近成员组件

### src/components/workspace/member/recent-members.tsx

```typescript
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const RecentMembers = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspaceMembers(workspaceId);

  const members = data?.members?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Team Members</CardTitle>
        <Link
          to={`/workspace/${workspaceId}/members`}
          className="text-sm text-muted-foreground hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.userId.profilePicture || ""} />
                  <AvatarFallback>
                    {member.userId.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{member.userId.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {member.role.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMembers;
```

---

## 7️⃣ 邀请加入页面

### src/page/invite/InviteUser.tsx

```typescript
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { invitedUserJoinWorkspaceMutationFn } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/logo";
import { Loader, CheckCircle, XCircle } from "lucide-react";

const InviteUser = () => {
  const navigate = useNavigate();
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const { mutate } = useMutation({
    mutationFn: invitedUserJoinWorkspaceMutationFn,
    onSuccess: (data) => {
      setStatus("success");
      setWorkspaceId(data.workspaceId);
    },
    onError: () => {
      setStatus("error");
    },
  });

  useEffect(() => {
    if (inviteCode) {
      mutate(inviteCode);
    }
  }, [inviteCode, mutate]);

  const handleGoToWorkspace = () => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}`);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6">
      <div className="flex items-center gap-2 font-medium">
        <Logo />
        Team Sync.
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "loading" && "Joining Workspace..."}
            {status === "success" && "Welcome!"}
            {status === "error" && "Invitation Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we process your invitation."}
            {status === "success" && "You have successfully joined the workspace."}
            {status === "error" && "The invitation link is invalid or has expired."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <Loader className="h-12 w-12 animate-spin text-primary" />
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <Button onClick={handleGoToWorkspace} className="w-full">
                Go to Workspace
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteUser;
```

---

## 8️⃣ 成员页面

### src/page/workspace/Members.tsx

```typescript
import { Separator } from "@/components/ui/separator";
import InviteMember from "@/components/workspace/member/invite-member";
import AllMembers from "@/components/workspace/member/all-members";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";

export default function Members() {
  return (
    <div className="w-full h-auto pt-2">
      <WorkspaceHeader />
      <Separator className="my-4 " />
      <main>
        <div className="w-full max-w-3xl mx-auto pt-3">
          <div>
            <h2 className="text-lg leading-[30px] font-semibold mb-1">
              Workspace members
            </h2>
            <p className="text-sm text-muted-foreground">
              Workspace members can view and join all Workspace project, tasks
              and create new task in the Workspace.
            </p>
          </div>
          <Separator className="my-4" />

          <InviteMember />
          <Separator className="my-4 !h-[0.5px]" />

          <AllMembers />
        </div>
      </main>
    </div>
  );
}
```

---

## ✅ 检查点

完成成员管理模块后，你应该能够：
- 查看工作空间成员列表
- 复制邀请链接
- 修改成员角色（需要权限）
- 通过邀请链接加入工作空间

---

## ➡️ 下一步

继续阅读 `09-ui-components.md` 了解 UI 组件实现。
