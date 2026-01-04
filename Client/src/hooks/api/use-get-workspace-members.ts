import { useQuery } from "@tanstack/react-query";
import { getMembersInWorkspaceQueryFn } from "@/lib/api";

const useGetWorkspaceMembers = (workspaceId: string) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    staleTime: Infinity,
  });

  return query;
};

export default useGetWorkspaceMembers;
