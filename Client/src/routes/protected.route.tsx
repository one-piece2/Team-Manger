import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/api/use-auth";
import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";

const ProtectedRoute = () => {
  const { data, isLoading } = useAuth();
  const user = data?.user;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;