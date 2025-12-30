import { useState } from "react";
import {
  ArrowRight,
  Folder,
  Loader,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-all-project";
import { Button } from "../ui/button";
import { type PaginationType, type ProjectType } from "@/types/api.type";
import { Permissions } from "@/constant";
import PermissionsGuard from "../resuable/permission-guard";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import { deleteProjectMutationFn } from "@/lib/api";
import { ConfirmDialog } from "../resuable/confirm-dialog";
import { toast } from "sonner";
//侧边栏项目导航
export function NavProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { isMobile } = useSidebar();
  const { onOpen } = useCreateProjectDialog();
  const { context, open, onOpenDialog, onCloseDialog } = useConfirmDialog<ProjectType>();
//分页
  const [pageNumber] = useState(1);
  //每页显示数量
  const [pageSize, setPageSize] = useState(5);

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteProjectMutationFn,
  });

  const { data, isPending, isFetching, isError } =
    useGetProjectsInWorkspaceQuery({
      workspaceId,
      pageSize,
      pageNumber,
    });

  const projects = data?.projects || [];
  const pagination = data?.pagination || ({} as PaginationType);
  //总页数是否大于当前页数
  const hasMore = pagination?.totalPages > pageNumber;

//获取下一页
  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPageSize((prev) => prev + 5);
  };

  const handleConfirm = () => {
    if (!context) return;
    mutate(
      {
        workspaceId,
        projectId: context?._id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            //只失效allprojects中workspaceId的数据
            queryKey: ["allprojects", workspaceId],
          });
          navigate(`/workspace/${workspaceId}`);
          setTimeout(() => onCloseDialog(), 500);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error.message)
         
        },
      }
    );
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden pr-0">
        <SidebarGroupLabel className="w-full items-center justify-between pr-0">
          <span>Projects</span>

          <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
            <button
              onClick={onOpen}
              type="button"
              className="flex size-5 items-center justify-center rounded-full border"
            >
              <Plus className="size-3.5" />
            </button>
          </PermissionsGuard>
        </SidebarGroupLabel>
        <SidebarMenu className="h-[320px] scrollbar overflow-y-auto pb-2">
          {isError ? <div>Error occured</div> : null}
          {isPending ? (
            <Loader className=" w-5 h-5 animate-spin place-self-center" />
          ) : null}
          {!isPending && projects?.length === 0 ? (
            <div className="pl-3">
              <p className="text-xs text-muted-foreground">
                There is no projects in this Workspace yet. Projects you create
                will show up here.
              </p>
              <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
                <Button
                  variant="link"
                  type="button"
                  className="h-0 p-0 text-[13px] underline font-semibold mt-4"
                  onClick={onOpen}
                >
                  Create a project
                  <ArrowRight />
                </Button>
              </PermissionsGuard>
            </div>
          ) : (
            projects?.map((item) => {
              const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;
              return (
                <SidebarMenuItem key={item._id}>
                  <SidebarMenuButton asChild isActive={projectUrl === pathname}>
                    <Link to={projectUrl}>
                      <span className="rounded-full border">{item.emoji}</span>
                      <span className="capitalize">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`${projectUrl}`)}
                      >
                        <Folder className="text-muted-foreground" />
                        <span>View Project</span>
                      </DropdownMenuItem>

                      <PermissionsGuard
                        requiredPermission={Permissions.DELETE_PROJECT}
                      >
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={isLoading}
                            onClick={() => onOpenDialog(item)}
                          >
                            <Trash2 className="text-muted-foreground" />
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </>
                      </PermissionsGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            })
          )}
          {hasMore && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-sidebar-foreground/70"
                disabled={isFetching}
                onClick={fetchNextPage}
              >
                <MoreHorizontal className="text-sidebar-foreground/70" />
                <span>{isFetching ? "Loading..." : "More"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      <ConfirmDialog
        isOpen={open}
        isLoading={isLoading}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete ${
          context?.name || "this item"
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}