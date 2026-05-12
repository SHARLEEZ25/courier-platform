import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminSurchargeConfig, AdminFuelSurcharge } from "@/types/api";

export interface RateCardStep {
  zone_code: string;
  shipment_type: string;
  weight_kg: number;
  price_inr: number;
}

export interface RateCardBand {
  zone_code: string;
  shipment_type: string;
  weight_min_kg: number;
  weight_max_kg: number | null;
  price_per_kg: number;
  base_price_inr: number | null;
  band_type: string;
}

export interface RateCardData {
  steps: RateCardStep[];
  bands: RateCardBand[];
  countries: { country: string; zone: string }[];
}

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

export function useRateCards(carrier: string) {
  return useQuery<RateCardData>({
    queryKey: ["admin", "rate-cards", carrier],
    queryFn: () => api.get<RateCardData>(`/admin/rate-cards/${carrier}`),
    staleTime: 10 * 60_000,
  });
}

export function useDeleteFuelSurcharge() {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => api.delete(`/admin/fuel-surcharges/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "fuel-surcharges"] });
    },
  });
}

export function useUpdateFuelSurcharge() {
  const qc = useQueryClient();
  return useMutation<
    AdminFuelSurcharge,
    Error,
    { id: string; fsc_percent: number; effective_to?: string | null }
  >({
    mutationFn: ({ id, ...body }) =>
      api.patch<AdminFuelSurcharge>(`/admin/fuel-surcharges/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "fuel-surcharges"] });
    },
  });
}

export function useSaveAllSurchargeConfig() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { carrier: string; updates: { key: string; value_num?: number; value_bool?: boolean }[] }
  >({
    mutationFn: async ({ carrier, updates }) => {
      await Promise.all(
        updates.map(({ key, ...val }) =>
          api.patch(`/admin/surcharge-config/${carrier}/${key}`, val)
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "surcharge-config"] });
    },
  });
}
