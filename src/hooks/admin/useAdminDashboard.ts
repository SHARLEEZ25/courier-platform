import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminDashboardStats } from "@/types/api";

export function useAdminDashboard() {
  return useQuery<AdminDashboardStats>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<AdminDashboardStats>("/admin/dashboard"),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
