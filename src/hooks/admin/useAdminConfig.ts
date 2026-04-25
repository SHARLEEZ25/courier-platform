import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminSurchargeConfig, AdminFuelSurcharge } from "@/types/api";

export function useAdminSurchargeConfig() {
  return useQuery<AdminSurchargeConfig>({
    queryKey: ["admin", "surcharge-config"],
    queryFn: () => api.get<AdminSurchargeConfig>("/admin/surcharge-config"),
    staleTime: 60_000,
  });
}

export function useUpdateSurchargeConfig() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { carrier: string; key: string; value_num?: number; value_bool?: boolean }
  >({
    mutationFn: ({ carrier, key, ...value }) =>
      api.patch(`/admin/surcharge-config/${carrier}/${key}`, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "surcharge-config"] });
    },
  });
}

export function useAdminFuelSurcharges() {
  return useQuery<AdminFuelSurcharge[]>({
    queryKey: ["admin", "fuel-surcharges"],
    queryFn: () => api.get<AdminFuelSurcharge[]>("/admin/fuel-surcharges"),
    staleTime: 60_000,
  });
}

export interface AddFuelSurchargePayload {
  carrier_id: string;
  fsc_percent: number;
  effective_from: string;
  effective_to?: string;
}

export function useAddFuelSurcharge() {
  const qc = useQueryClient();

  return useMutation<AdminFuelSurcharge, Error, AddFuelSurchargePayload>({
    mutationFn: (payload) => api.post<AdminFuelSurcharge>("/admin/fuel-surcharges", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "fuel-surcharges"] });
    },
  });
}
