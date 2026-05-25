import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PincodeResult } from "@/types/api";

export function usePincode(pincode: string) {
  return useQuery<PincodeResult>({
    queryKey: ["pincode", pincode],
    queryFn: () => api.post<PincodeResult>("/pincode/lookup", { pincode }),
    enabled: /^\d{6}$/.test(pincode),
    staleTime: 1000 * 60 * 30, // pincodes don't change — cache 30 min
    retry: false,
  });
}
