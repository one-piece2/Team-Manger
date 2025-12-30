import { useParams } from "react-router-dom";

const useWorkspaceId = () => {
  const params = useParams<{ workspaceId: string }>();
  return params.workspaceId as string;
};

export default useWorkspaceId;