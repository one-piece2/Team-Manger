import { useParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { getProjectByIdQueryFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";

const ProjectHeader = () => {
    //获取项目id
  const param = useParams();
  const projectId = param.projectId as string;

  const workspaceId = useWorkspaceId();

  const { data, isPending, isError } = useQuery({
    queryKey: ["singleProject", projectId],
    queryFn: () => getProjectByIdQueryFn({ workspaceId, projectId }),
    staleTime: Infinity,
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });

  const project = data?.project;


  const projectEmoji = project?.emoji || "📊";
  const projectName = project?.name || "Untitled project";

  const renderContent = () => {
    if (isPending) return <span>Loading...</span>;
    if (isError) return <span>Error occured</span>;
    return (
      <>
        <span>{projectEmoji}</span>
        {projectName}
      </>
    );
  };
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="flex items-center gap-3 text-xl font-medium truncate tracking-tight">
          {renderContent()}
        </h2>
        <PermissionsGuard requiredPermission={Permissions.EDIT_PROJECT}>
          <EditProjectDialog project={project} />
        </PermissionsGuard>
      </div>
      <PermissionsGuard requiredPermission={Permissions.CREATE_TASK}>
        <CreateTaskDialog projectId={projectId} />
      </PermissionsGuard>
    </div>
  );
};

export default ProjectHeader;