import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDestinations() {
  return useQuery<string[]>({
    queryKey: ["destinations"],
    queryFn: () => api.get<string[]>("/destinations"),
    staleTime: 1000 * 60 * 30, // 30 min — countries don't change without a re-seed
  });
}
