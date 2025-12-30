import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProjectsInWorkspaceQueryFn } from "@/lib/api";
import {type AllProjectPayloadType } from "@/types/api.type";

const useGetProjectsInWorkspaceQuery = ({
  workspaceId,
  pageSize,
  pageNumber,
  skip = false,
}: AllProjectPayloadType) => {
  const query = useQuery({
    queryKey: ["allprojects", workspaceId, pageNumber, pageSize],
    queryFn: () =>
      getProjectsInWorkspaceQueryFn({
        workspaceId,
        pageSize,
        pageNumber,
      }),
    staleTime: Infinity,
   //分页查询的时候，点击切换页数的时候 先用前一页的数据做占位符，避免转圈圈，避免闪烁  加载完之后才显示数据
    placeholderData: skip ? undefined : keepPreviousData,
    enabled: !skip,
  });

  return query;
};

export default useGetProjectsInWorkspaceQuery;