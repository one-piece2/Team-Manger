import { useQuery } from "@tanstack/react-query";
import { getMembersInWorkspaceQueryFn } from "@/lib/api";

const useWorkspaceMembers = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    staleTime: Infinity,
  });

  return query;
};

export default useWorkspaceMembers;
