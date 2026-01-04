# 05 - 工作空间模块

## 📋 概述

工作空间模块包括：
- 工作空间列表与切换
- 创建工作空间
- 编辑工作空间
- 删除工作空间
- 工作空间分析统计

---

## 1️⃣ 类型定义

### src/types/api.type.ts (工作空间部分)

```typescript
// 工作空间类型
export type WorkspaceType = {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
};

// 角色类型
export type RoleType = {
  _id: string;
  name: string;
  permissions: PermissionType[];
};

// 创建工作空间
export type CreateWorkspaceType = {
  name: string;
  description?: string;
};

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

// 获取单个工作空间
export type WorkspaceByIdResponseType = {
  message: string;
  workspace: WorkspaceType;
  role: RoleType;
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
```

---

## 2️⃣ API 函数

### src/lib/api.ts (工作空间部分)

```typescript
import API from "./axios-client";
import {
  CreateWorkspaceType,
  CreateWorkspaceResponseType,
  AllWorkspaceResponseType,
  WorkspaceByIdResponseType,
  EditWorkspaceType,
  AnalyticsResponseType,
} from "@/types/api.type";

// 创建工作空间
export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data);
  return response.data;
};

// 编辑工作空间
export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

// 获取用户所有工作空间
export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`);
    return response.data;
  };

// 获取单个工作空间
export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

// 获取工作空间分析数据
export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

// 删除工作空间
export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{ message: string; currentWorkspace: string }> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};
```

---

## 3️⃣ 工作空间切换器

### src/components/asidebar/workspace-switcher.tsx

```typescript
import { ChevronsUpDown, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { Loader } from "lucide-react";

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { onOpen } = useCreateWorkspaceDialog();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    staleTime: Infinity,
  });

  const workspaces = data?.workspaces || [];
  const activeWorkspace = workspaces.find((ws) => ws._id === workspaceId);

  const handleWorkspaceChange = (id: string) => {
    navigate(`/workspace/${id}`);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {activeWorkspace?.name?.charAt(0) || "W"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeWorkspace?.name || "Select Workspace"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace._id}
                onClick={() => handleWorkspaceChange(workspace._id)}
                className="cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-sm bg-primary text-primary-foreground mr-2">
                  {workspace.name.charAt(0)}
                </div>
                {workspace.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpen} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

---

## 4️⃣ 创建工作空间对话框

### src/components/workspace/create-workspace-dialog.tsx

```typescript
import WorkspaceForm from "./create-workspace-form";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const CreateWorkspaceDialog = () => {
  const { open, onClose } = useCreateWorkspaceDialog();

  return (
    <Dialog modal={true} open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl !p-0 overflow-hidden border-0">
        <WorkspaceForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;
```

### src/components/workspace/create-workspace-form.tsx

```typescript
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { createWorkspaceMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

export default function CreateWorkspaceForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Workspace name is required",
    }),
    description: z.string().trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });
        const workspace = data.workspace;
        onClose();
        navigate(`/workspace/${workspace._id}`);
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <main className="w-full flex flex-row min-h-[590px] h-auto max-w-full">
      <div className="h-full px-10 py-10 flex-1">
        <div className="mb-5">
          <h1
            className="text-2xl tracking-[-0.16px] dark:text-[#fcfdffef] font-semibold mb-1.5
           text-center sm:text-left"
          >
            Let's build a Workspace
          </h1>
          <p className="text-muted-foreground text-lg leading-tight">
            Boost your productivity by making it easier for everyone to access
            projects in one location.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Workspace name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Engineering Core"
                        className="!h-[48px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the name of a department in your organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                      Workspace description
                      <span className="text-xs font-extralight ml-2">
                        Optional
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Our team organizes marketing projects and tasks here."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Get your members on board with a few words about your
                      Workspace.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              className="w-full h-[40px] text-white font-semibold"
              disabled={isPending}
              type="submit"
            >
              {isPending && <Loader className="animate-spin" />}
              Create Workspace
            </Button>
          </form>
        </Form>
      </div>
      <div
        className="relative flex-1 shrink-0 hidden bg-muted md:block
      bg-[url('/images/workspace.jpg')] bg-cover bg-center h-full
      "
      />
    </main>
  );
}
```

---

## 5️⃣ 编辑工作空间表单

### src/components/workspace/edit-workspace-form.tsx

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/context/auth-provider";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editWorkspaceMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { Permissions } from "@/constant";

export default function EditWorkspaceForm() {
  const { workspace, hasPermission } = useAuthContext();
  const canEditWorkspace = hasPermission(Permissions.EDIT_WORKSPACE);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: editWorkspaceMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Workspace name is required" }),
    description: z.string().trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (workspace) {
      form.setValue("name", workspace.name);
      form.setValue("description", workspace?.description || "");
    }
  }, [form, workspace]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(
      { workspaceId, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["workspace"] });
          queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });
          toast({
            title: "Success",
            description: "Workspace updated successfully",
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
      }
    );
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 border-b">
          <h1 className="text-[17px] font-semibold mb-1.5">Edit Workspace</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Taco's Co."
                        className="!h-[48px]"
                        disabled={!canEditWorkspace}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Workspace description
                      <span className="text-xs font-extralight ml-2">Optional</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        disabled={!canEditWorkspace}
                        placeholder="Our team organizes marketing projects and tasks here."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {canEditWorkspace && (
              <Button className="h-[40px] text-white font-semibold" disabled={isPending} type="submit">
                {isPending && <Loader className="animate-spin" />}
                Update Workspace
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
```

---

## 6️⃣ 工作空间分析卡片

### src/components/workspace/common/analytics-card.tsx

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsCardProps {
  title: string;
  value: number;
  isLoading?: boolean;
}

const AnalyticsCard = ({ title, value, isLoading }: AnalyticsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
```

### src/components/workspace/workspace-analytics.tsx

```typescript
import useWorkspaceId from "@/hooks/use-workspace-id";
import AnalyticsCard from "./common/analytics-card";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";

const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const analytics = data?.analytics;

  return (
    <div className="grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <AnalyticsCard
        isLoading={isPending}
        title="Total Tasks"
        value={analytics?.totalTasks || 0}
      />
      <AnalyticsCard
        isLoading={isPending}
        title="Overdue Tasks"
        value={analytics?.overdueTasks || 0}
      />
      <AnalyticsCard
        isLoading={isPending}
        title="Completed Tasks"
        value={analytics?.completedTasks || 0}
      />
    </div>
  );
};

export default WorkspaceAnalytics;
```

---

## 7️⃣ 删除工作空间

### src/components/workspace/settings/delete-workspace-card.tsx

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkspaceMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader, Trash2 } from "lucide-react";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import useConfirmDialog from "@/hooks/use-confirm-dialog";

const DeleteWorkspaceCard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { hasPermission } = useAuthContext();
  const canDeleteWorkspace = hasPermission(Permissions.DELETE_WORKSPACE);
  const { open, onOpenDialog, onCloseDialog } = useConfirmDialog();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWorkspaceMutationFn,
  });

  const handleDelete = () => {
    mutate(workspaceId, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });
        toast({
          title: "Success",
          description: "Workspace deleted successfully",
          variant: "success",
        });
        navigate(`/workspace/${data.currentWorkspace}`);
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

  if (!canDeleteWorkspace) return null;

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Once you delete a workspace, there is no going back. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => onOpenDialog(null)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="animate-spin mr-2" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete Workspace
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={open}
        isLoading={isPending}
        onClose={onCloseDialog}
        onConfirm={handleDelete}
        title="Delete Workspace"
        description="Are you sure you want to delete this workspace? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default DeleteWorkspaceCard;
```

---

## ✅ 检查点

完成工作空间模块后，你应该能够：
- 查看工作空间列表
- 切换工作空间
- 创建新工作空间
- 编辑工作空间信息
- 删除工作空间
- 查看工作空间分析数据

---

## ➡️ 下一步

继续阅读 `06-project-module.md` 实现项目管理模块。
