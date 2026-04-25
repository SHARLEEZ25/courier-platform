import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { AdminMe } from "@/types/api";
import { useAuth } from "@/context/AuthContext";

export function useAdminMe() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery<AdminMe, ApiError>({
    queryKey: ["admin", "me"],
    queryFn: () => api.get<AdminMe>("/admin/me"),
    enabled: !authLoading && !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isAdmin: query.isSuccess,
    isForbidden: query.error?.status === 403,
  };
}
