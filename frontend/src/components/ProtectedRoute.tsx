import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageLoader from "@/components/PageLoader";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${location.pathname}`}
        replace
        state={location.state}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
