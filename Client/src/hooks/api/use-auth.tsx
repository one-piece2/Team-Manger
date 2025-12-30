import { useQuery } from "@tanstack/react-query";
import { getCurrentUserQueryFn } from "@/lib/api";

const useAuth = () => {
  const query = useQuery({
    //整个应用 使用该key的地方 共享同一份缓存数据
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    //staleTime: Infinity,
    //数据被视为立刻过期,这意味着：只要有组件挂载并使用了useAuth,或者窗口重新聚焦, React Query 都会在后台默默发一次请求去确认用户状态。
    staleTime: 0,
    retry: 2,
  });
  return query;
};

export default useAuth;