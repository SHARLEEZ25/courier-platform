import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminMe } from "@/hooks/admin/useAdminMe";
import PageLoader from "@/components/PageLoader";
import AdminLayout from "@/pages/admin/AdminLayout";

const AdminRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const { isForbidden, isLoading: adminCheckLoading } = useAdminMe();

  if (authLoading || (!!user && adminCheckLoading)) {
    return <PageLoader message="Verifying access…" />;
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (isForbidden) return <Navigate to="/" replace />;

  return <AdminLayout />;
};

export default AdminRoute;
