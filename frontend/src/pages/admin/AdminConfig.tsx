import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  useAdminSurchargeConfig,
  useAdminFuelSurcharges,
  useAddFuelSurcharge,
  useUpdateFuelSurcharge,
  useDeleteFuelSurcharge,
  useRateCards,
  useSaveAllSurchargeConfig,
  type RateCardStep,
  type RateCardBand,
} from "@/hooks/admin/useAdminConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { AdminFuelSurcharge } from "@/types/api";

// ── Types ─────────────────────────────────────────────────────────────────────

const CARRIERS = ["dhl", "fedex", "ups"] as const;
type CarrierSlug = (typeof CARRIERS)[number];

interface LocalSettings {
  margin_pct: number;
  fsc_pct: number;
  demand_active: boolean;
  demand_per_kg: number;
  peak_active?: boolean;
  peak_amount?: number;
  surge_active?: boolean;
  surge_amount?: number;
}

type DraftState = Record<CarrierSlug, LocalSettings>;

const DEFAULT_DRAFT: DraftState = {
  dhl:   { margin_pct: 20, fsc_pct: 0, demand_active: false, demand_per_kg: 0 },
  fedex: { margin_pct: 20, fsc_pct: 0, demand_active: false, demand_per_kg: 0, peak_active: false, peak_amount: 0 },
  ups:   { margin_pct: 20, fsc_pct: 0, demand_active: false, demand_per_kg: 0, surge_active: false, surge_amount: 0 },
};

// ── Pure helpers ──────────────────────────────────────────────────────────────

function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  return s.substring(0, 10); // "2026-03-01T00:00:00.000Z" → "2026-03-01"
}

interface RateMatrix {
  weights: number[];
  zones: string[];
  lookup: Map<string, number>;
}

function buildMatrix(steps: RateCardStep[], shipmentType: string): RateMatrix {
  const filtered  = steps.filter((s) => s.shipment_type === shipmentType);
  const weightSet = new Set<number>();
  const zoneSet   = new Set<string>();
  const lookup    = new Map<string, number>();
  for (const s of filtered) {
    weightSet.add(s.weight_kg);
    zoneSet.add(s.zone_code);
    lookup.set(`${s.weight_kg}-${s.zone_code}`, s.price_inr);
  }
  return {
    weights: [...weightSet].sort((a, b) => a - b),
    zones:   [...zoneSet].sort((a, b) => a.localeCompare(b)),
    lookup,
  };
}

interface BandMatrix {
  rows: { weight_min_kg: number; weight_max_kg: number | null; price_per_kg: number; base_price_inr: number | null; band_type: string }[];
  zones: string[];
  byZone: Map<string, Map<number, { price_per_kg: number; base_price_inr: number | null; band_type: string }>>;
}

function buildBandMatrix(bands: RateCardBand[], shipmentType: string): BandMatrix {
  const filtered = bands.filter((b) => b.shipment_type === shipmentType);
  const rowKeys  = new Map<number, { weight_min_kg: number; weight_max_kg: number | null; price_per_kg: number; base_price_inr: number | null; band_type: string }>();
  const zoneSet  = new Set<string>();
  const byZone   = new Map<string, Map<number, { price_per_kg: number; base_price_inr: number | null; band_type: string }>>();
  for (const b of filtered) {
    rowKeys.set(b.weight_min_kg, { weight_min_kg: b.weight_min_kg, weight_max_kg: b.weight_max_kg, price_per_kg: b.price_per_kg, base_price_inr: b.base_price_inr, band_type: b.band_type });
    zoneSet.add(b.zone_code);
    if (!byZone.has(b.zone_code)) byZone.set(b.zone_code, new Map());
    byZone.get(b.zone_code)!.set(b.weight_min_kg, { price_per_kg: b.price_per_kg, base_price_inr: b.base_price_inr, band_type: b.band_type });
  }
  const rows  = [...rowKeys.values()].sort((a, b) => a.weight_min_kg - b.weight_min_kg);
  const zones = [...zoneSet].sort((a, b) => a.localeCompare(b));
  return { rows, zones, byZone };
}

function computeEffective(basePrice: number, weight: number, settings: LocalSettings): number {
  const withMargin = basePrice * (1 + settings.margin_pct / 100);
  const fsc        = withMargin * (settings.fsc_pct / 100);
  const demand     = settings.demand_active ? settings.demand_per_kg * weight : 0;
  return Math.round((withMargin + fsc + demand) * 1.18);
}

function fmt(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// ── RateCardTable ─────────────────────────────────────────────────────────────

function RateCardTable({
  matrix,
  settings,
  viewMode,
  highlightWeight,
  highlightZone,
}: {
  matrix: RateMatrix;
  settings: LocalSettings;
  viewMode: "base" | "effective";
  highlightWeight: number | null;
  highlightZone: string | null;
}) {
  const isEffective = viewMode === "effective";
  const highlightRowRef = useCallback((node: HTMLTableRowElement | null) => {
    if (node) node.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightWeight]); // eslint-disable-line react-hooks/exhaustive-deps

  if (matrix.weights.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No rate data found.</p>;
  }

  return (
    <div className="overflow-auto max-h-[420px] rounded border border-gray-100">
      <table className="text-xs border-collapse w-full">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className={`sticky left-0 z-20 px-3 py-2 text-left font-semibold border border-gray-200 ${isEffective ? "bg-blue-50 text-blue-800" : "bg-gray-50 text-gray-700"}`}>
              Weight
            </th>
            {matrix.zones.map((z) => (
              <th
                key={z}
                className={`px-3 py-2 text-right font-semibold border border-gray-200 whitespace-nowrap transition-colors ${
                  isEffective ? "bg-blue-50" : "bg-gray-50"
                } ${z === highlightZone ? "text-amber-700 bg-amber-50" : isEffective ? "text-blue-800" : "text-gray-600"}`}
              >
                Zone {z}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.weights.map((w) => {
            const isHlRow = w === highlightWeight;
            return (
              <tr
                key={w}
                ref={isHlRow ? highlightRowRef : undefined}
                className={`${isHlRow ? "bg-amber-50" : "hover:bg-gray-50"}`}
              >
                <td className={`sticky left-0 z-10 px-3 py-1.5 font-medium border border-gray-100 whitespace-nowrap ${isHlRow ? "bg-amber-50 text-amber-900" : "bg-white text-gray-700"}`}>
                  {w} kg
                </td>
                {matrix.zones.map((z) => {
                  const base    = matrix.lookup.get(`${w}-${z}`);
                  const isHlCell = isHlRow && z === highlightZone;
                  const display  = base === undefined
                    ? "—"
                    : isEffective
                      ? fmt(computeEffective(base, w, settings))
                      : fmt(base);
                  return (
                    <td
                      key={z}
                      className={`px-3 py-1.5 text-right font-mono border border-gray-100 transition-colors ${
                        isHlCell
                          ? "bg-amber-300 text-amber-900 font-bold ring-1 ring-amber-400"
                          : isHlRow
                            ? isEffective ? "text-blue-700" : "text-gray-700"
                            : isEffective ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── BandTable ─────────────────────────────────────────────────────────────────

function BandTable({
  bandMatrix, settings, viewMode, highlightZone, highlightChargeable,
}: {
  bandMatrix: BandMatrix;
  settings: LocalSettings;
  viewMode: "base" | "effective";
  highlightZone: string | null;
  highlightChargeable: number | null;
}) {
  const isEffective = viewMode === "effective";

  const hlRowRef = useCallback((node: HTMLTableRowElement | null) => {
    if (node) node.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightChargeable]); // eslint-disable-line react-hooks/exhaustive-deps

  if (bandMatrix.rows.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Heavy Weight (per-kg bands)</p>
      <div className="overflow-auto max-h-[280px] rounded border border-gray-100">
        <table className="text-xs border-collapse w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className={`sticky left-0 z-20 px-3 py-2 text-left font-semibold border border-gray-200 ${isEffective ? "bg-blue-50 text-blue-800" : "bg-gray-50 text-gray-600"}`}>Range (kg)</th>
              {bandMatrix.zones.map((z) => (
                <th
                  key={z}
                  className={`px-3 py-2 text-right font-semibold border border-gray-200 whitespace-nowrap transition-colors ${
                    z === highlightZone
                      ? "bg-amber-50 text-amber-700"
                      : isEffective ? "bg-blue-50 text-blue-800" : "bg-gray-50 text-gray-600"
                  }`}
                >
                  Zone {z}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bandMatrix.rows.map((row) => {
              const isHlRow = highlightChargeable !== null
                && row.weight_min_kg <= highlightChargeable
                && (row.weight_max_kg === null || highlightChargeable <= row.weight_max_kg);
              return (
                <tr
                  key={row.weight_min_kg}
                  ref={isHlRow ? hlRowRef : undefined}
                  className={isHlRow ? "bg-amber-50" : "hover:bg-gray-50"}
                >
                  <td className={`sticky left-0 z-10 px-3 py-1.5 font-medium border border-gray-100 whitespace-nowrap ${isHlRow ? "bg-amber-50 text-amber-900" : "bg-white text-gray-700"}`}>
                    {row.weight_min_kg}{row.weight_max_kg ? `–${row.weight_max_kg}` : "+"} kg
                  </td>
                  {bandMatrix.zones.map((z) => {
                    const band      = bandMatrix.byZone.get(z)?.get(row.weight_min_kg);
                    const isHlCell  = isHlRow && z === highlightZone;
                    if (!band) return <td key={z} className="px-3 py-1.5 text-right border border-gray-100 text-gray-300">—</td>;
                    let display: string;
                    if (!isEffective) {
                      display = band.band_type === "multiplied"
                        ? `₹${band.price_per_kg}/kg`
                        : `₹${band.base_price_inr ?? 0}+₹${band.price_per_kg}/kg`;
                    } else {
                      const mid       = row.weight_max_kg ? (row.weight_min_kg + row.weight_max_kg) / 2 : row.weight_min_kg + 10;
                      const baseAtMid = band.band_type === "multiplied"
                        ? band.price_per_kg * mid
                        : (band.base_price_inr ?? 0) + band.price_per_kg * (mid - row.weight_min_kg);
                      display = fmt(computeEffective(baseAtMid, mid, settings)) + " (mid)";
                    }
                    return (
                      <td
                        key={z}
                        className={`px-3 py-1.5 text-right font-mono border border-gray-100 transition-colors ${
                          isHlCell
                            ? "bg-amber-300 text-amber-900 font-bold ring-1 ring-amber-400"
                            : isHlRow
                              ? isEffective ? "text-blue-700" : "text-gray-700"
                              : isEffective ? "text-blue-700" : "text-gray-700"
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isEffective && <p className="mt-1 text-xs text-gray-400">* Effective price shown at midpoint weight as estimate.</p>}
    </div>
  );
}

// ── RateCalculator ────────────────────────────────────────────────────────────

// Max chargeable kg that qualifies as a document shipment, per carrier
const DOC_THRESHOLD: Record<CarrierSlug, number> = { dhl: 2.0, fedex: 2.5, ups: 5.0 };

// Returns true if the given weight+country combo has any step or band match for a carrier
function carrierHasMatch(
  weight: string,
  country: string,
  carrier: CarrierSlug,
  rateCard: { steps: RateCardStep[]; bands: RateCardBand[]; countries: { country: string; zone: string }[] } | undefined,
): boolean {
  if (!rateCard) return false;
  const w = parseFloat(weight);
  if (!w) return false;
  const chargeable = Math.ceil(w * 2) / 2;
  const zone = rateCard.countries.find((c) => c.country.toLowerCase() === country.trim().toLowerCase())?.zone;
  if (!zone) return false;
  const shipType = chargeable <= DOC_THRESHOLD[carrier] ? "document" : "package";
  const m  = buildMatrix(rateCard.steps, shipType);
  const bm = buildBandMatrix(rateCard.bands, shipType);
  if (m.zones.includes(zone)) {
    const lw = m.weights.find((mw) => mw >= chargeable);
    if (lw && m.lookup.has(`${lw}-${zone}`)) return true;
  }
  if (bm.zones.includes(zone)) {
    const row = bm.rows.find((r) => r.weight_min_kg <= chargeable && (r.weight_max_kg === null || chargeable <= r.weight_max_kg));
    if (row && bm.byZone.get(zone)?.has(row.weight_min_kg)) return true;
  }
  return false;
}

function RateCalculator({
  matrix,
  bandMatrix,
  settings,
  countries,
  activeCarrier,
  weight,
  country,
  onWeightChange,
  onCountryChange,
  onSelect,
  onShipmentTypeChange,
}: {
  matrix: RateMatrix;
  bandMatrix: BandMatrix;
  settings: LocalSettings;
  countries: { country: string; zone: string }[];
  activeCarrier: CarrierSlug;
  weight: string;
  country: string;
  onWeightChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onSelect: (stepWeight: number | null, chargeableKg: number | null, zone: string | null) => void;
  onShipmentTypeChange: (t: "document" | "package") => void;
}) {
  const [zone,       setZone]       = useState("");
  const [includeGst, setIncludeGst] = useState(true);

  // country → zone lookup (carrier-specific — changes when carrier switches)
  const countryToZone = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of countries) m.set(c.country.toLowerCase(), c.zone);
    return m;
  }, [countries]);

  // Re-derive zone when carrier switches (countryToZone changes)
  useEffect(() => {
    if (!country) return;
    const z = countryToZone.get(country.trim().toLowerCase());
    setZone(z ?? "");
  }, [countryToZone]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCountryChange(val: string) {
    onCountryChange(val);
    const z = countryToZone.get(val.trim().toLowerCase());
    if (z) setZone(z);
    else setZone("");
  }

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || !zone) return null;
    const chargeable = Math.ceil(w * 2) / 2;

    // Try steps table first
    if (matrix.zones.includes(zone)) {
      const lookupWeight = matrix.weights.find((mw) => mw >= chargeable) ?? null;
      if (lookupWeight) {
        const base = matrix.lookup.get(`${lookupWeight}-${zone}`);
        if (base !== undefined) {
          const withMargin = base * (1 + settings.margin_pct / 100);
          const fsc        = withMargin * (settings.fsc_pct / 100);
          const demand     = settings.demand_active ? settings.demand_per_kg * chargeable : 0;
          const preGst     = withMargin + fsc + demand;
          const gst        = preGst * 0.18;
          return { base, marginAdded: withMargin - base, fsc, demand, gst, preGst, total: Math.round(preGst + gst), chargeable, lookupWeight, fromBand: false };
        }
      }
    }

    // Fall back to bands table
    if (bandMatrix.zones.includes(zone)) {
      const bandRow = bandMatrix.rows.find(
        (r) => r.weight_min_kg <= chargeable && (r.weight_max_kg === null || chargeable <= r.weight_max_kg)
      );
      if (bandRow) {
        const band = bandMatrix.byZone.get(zone)?.get(bandRow.weight_min_kg);
        if (band) {
          const base = band.band_type === "multiplied"
            ? band.price_per_kg * chargeable
            : (band.base_price_inr ?? 0) + band.price_per_kg * (chargeable - bandRow.weight_min_kg);
          const withMargin = base * (1 + settings.margin_pct / 100);
          const fsc        = withMargin * (settings.fsc_pct / 100);
          const demand     = settings.demand_active ? settings.demand_per_kg * chargeable : 0;
          const preGst     = withMargin + fsc + demand;
          const gst        = preGst * 0.18;
          return { base, marginAdded: withMargin - base, fsc, demand, gst, preGst, total: Math.round(preGst + gst), chargeable, lookupWeight: null, fromBand: true };
        }
      }
    }

    return null;
  }, [weight, zone, matrix, bandMatrix, settings]);

  // Auto-switch Documents / Packages tab when weight changes
  useEffect(() => {
    const w = parseFloat(weight);
    if (!w) return;
    const chargeable = Math.ceil(w * 2) / 2;
    onShipmentTypeChange(chargeable <= DOC_THRESHOLD[activeCarrier] ? "document" : "package");
  }, [weight, activeCarrier]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bubble selection up to parent for cell highlighting
  useEffect(() => {
    if (!result) { onSelect(null, null, null); return; }
    onSelect(result.lookupWeight, result.chargeable, zone);
  }, [result, zone]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 mt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Rate Calculator</p>
      <div className="flex flex-wrap items-end gap-3 mb-3 sm:flex-row flex-col sm:items-end items-start">
        <div>
          <Label className="text-xs">Weight (kg)</Label>
          <Input
            type="number" min="0.1" step="0.5" placeholder="e.g. 5"
            value={weight} onChange={(e) => onWeightChange(e.target.value)}
            className="mt-1 w-full sm:w-28"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Label className="text-xs">Destination country</Label>
          <Input
            list="country-list" placeholder="e.g. USA"
            value={country} onChange={(e) => handleCountryChange(e.target.value)}
            className="mt-1 w-full sm:w-40"
          />
          <datalist id="country-list">
            {countries.map((c) => (
              <option key={c.country} value={c.country} />
            ))}
          </datalist>
        </div>
        {/* GST toggle */}
        <div className="flex items-center gap-2 pb-1">
          <button
            type="button"
            onClick={() => setIncludeGst((v) => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${includeGst ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${includeGst ? "translate-x-4" : "translate-x-1"}`} />
          </button>
          <Label className="text-xs cursor-pointer select-none" onClick={() => setIncludeGst((v) => !v)}>
            GST (18%)
          </Label>
        </div>
      </div>

      {result ? (
        <table className="text-xs w-full">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-1 text-gray-500">Base rate ({result.chargeable} kg, Zone {zone})</td>
              <td className="py-1 text-right font-mono text-gray-700">{fmt(result.base)}</td>
            </tr>
            <tr>
              <td className="py-1 text-gray-500">+ Margin ({settings.margin_pct}%)</td>
              <td className="py-1 text-right font-mono text-gray-700">+{fmt(result.marginAdded)}</td>
            </tr>
            <tr>
              <td className="py-1 text-gray-500">+ FSC ({settings.fsc_pct}%)</td>
              <td className="py-1 text-right font-mono text-gray-700">+{fmt(result.fsc)}</td>
            </tr>
            {result.demand > 0 && (
              <tr>
                <td className="py-1 text-gray-500">+ Demand surcharge</td>
                <td className="py-1 text-right font-mono text-gray-700">+{fmt(result.demand)}</td>
              </tr>
            )}
            {includeGst && (
              <tr>
                <td className="py-1 text-gray-500">+ GST (18%)</td>
                <td className="py-1 text-right font-mono text-gray-700">+{fmt(result.gst)}</td>
              </tr>
            )}
            <tr className="font-semibold">
              <td className="pt-2 text-gray-800">Customer pays</td>
              <td className="pt-2 text-right font-mono text-blue-700 text-sm">
                {fmt(includeGst ? result.total : Math.round(result.preGst))}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-gray-400">Enter weight and country to see breakdown.</p>
      )}
    </div>
  );
}

// ── FscHistoryPanel ───────────────────────────────────────────────────────────

function FscRowEdit({ row, onDone }: { row: AdminFuelSurcharge; onDone: () => void }) {
  const { toast }    = useToast();
  const updateFsc    = useUpdateFuelSurcharge();
  const [pct, setPct] = useState(String(row.fsc_percent));
  const [to, setTo]   = useState(formatDate(row.effective_to));

  async function handleSave() {
    try {
      await updateFsc.mutateAsync({ id: row.id, fsc_percent: Number(pct), effective_to: to || null });
      toast({ title: "FSC updated" });
      onDone();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="mt-1 space-y-1 rounded-md bg-blue-50 p-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-[10px]">FSC %</Label>
          <Input type="number" step="0.01" min="0" max="100" value={pct} onChange={(e) => setPct(e.target.value)} className="mt-0.5 h-6 text-xs" />
        </div>
        <div className="flex-1">
          <Label className="text-[10px]">Effective To</Label>
          <Input type="date" value={to === "—" ? "" : to} onChange={(e) => setTo(e.target.value)} className="mt-0.5 h-6 text-xs" />
        </div>
      </div>
      <div className="flex gap-1 justify-end">
        <button onClick={onDone} className="rounded p-1 text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
        <button onClick={handleSave} disabled={updateFsc.isPending} className="rounded p-1 text-green-600 hover:text-green-800">
          {updateFsc.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

function FscHistoryPanel({ carrier }: { carrier: CarrierSlug }) {
  const { toast }                    = useToast();
  const { data: fscRows, isLoading } = useAdminFuelSurcharges();
  const addFsc                       = useAddFuelSurcharge();
  const deleteFsc                    = useDeleteFuelSurcharge();
  const [open, setOpen]              = useState(false);
  const [editId, setEditId]          = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [fscPct, setFscPct]         = useState("");
  const [fscFrom, setFscFrom]       = useState("");
  const [fscTo, setFscTo]           = useState("");

  const carrierRows = (fscRows ?? []).filter((r: AdminFuelSurcharge) => r.carrier_id === carrier);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addFsc.mutateAsync({ carrier_id: carrier, fsc_percent: Number(fscPct), effective_from: fscFrom, effective_to: fscTo || undefined });
      toast({ title: "FSC row added" });
      setFscPct(""); setFscFrom(""); setFscTo(""); setOpen(false);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFsc.mutateAsync(id);
      toast({ title: "FSC row deleted" });
      setConfirmDeleteId(null);
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">FSC History</p>
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
      ) : carrierRows.length === 0 ? (
        <p className="text-xs text-gray-400">No FSC entries.</p>
      ) : (
        <div className="space-y-1">
          {carrierRows.slice(0, 5).map((r: AdminFuelSurcharge) => (
            <div key={r.id}>
              {editId === r.id ? (
                <FscRowEdit row={r} onDone={() => setEditId(null)} />
              ) : confirmDeleteId === r.id ? (
                <div className="flex items-center justify-between gap-1 rounded bg-red-50 px-2 py-1">
                  <span className="text-[10px] text-red-600">Delete {r.fsc_percent}%?</span>
                  <div className="flex gap-1">
                    <button onClick={() => setConfirmDeleteId(null)} className="rounded p-0.5 text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleteFsc.isPending}
                      className="rounded p-0.5 text-red-500 hover:text-red-700"
                    >
                      {deleteFsc.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1 group">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono font-semibold text-gray-700 text-xs">{r.fsc_percent}%</span>
                    <span className="ml-2 text-gray-400 text-[10px]">
                      {formatDate(r.effective_from)} → {r.effective_to ? formatDate(r.effective_to) : "now"}
                    </span>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditId(r.id); setConfirmDeleteId(null); }} className="rounded p-0.5 text-gray-300 hover:text-blue-500" title="Edit">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => { setConfirmDeleteId(r.id); setEditId(null); }} className="rounded p-0.5 text-gray-300 hover:text-red-500" title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {carrierRows.length > 5 && <p className="text-[10px] text-gray-400">+{carrierRows.length - 5} older entries</p>}
        </div>
      )}

      <button onClick={() => setOpen((v) => !v)} className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Add new FSC row
      </button>

      {open && (
        <form onSubmit={handleAdd} className="mt-2 space-y-2">
          <div>
            <Label className="text-xs">FSC %</Label>
            <Input type="number" step="0.01" min="0" max="100" placeholder="e.g. 27.50" value={fscPct} onChange={(e) => setFscPct(e.target.value)} className="mt-1 h-7 text-xs" required />
          </div>
          <div>
            <Label className="text-xs">Effective From</Label>
            <Input type="date" value={fscFrom} onChange={(e) => setFscFrom(e.target.value)} className="mt-1 h-7 text-xs" required />
          </div>
          <div>
            <Label className="text-xs">Effective To (optional)</Label>
            <Input type="date" value={fscTo} onChange={(e) => setFscTo(e.target.value)} className="mt-1 h-7 text-xs" />
          </div>
          <Button type="submit" size="sm" disabled={addFsc.isPending || !fscPct || !fscFrom} className="w-full h-7 text-xs">
            {addFsc.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save FSC"}
          </Button>
        </form>
      )}
    </div>
  );
}

// ── SurchargePanel ────────────────────────────────────────────────────────────

function SurchargePanel({
  carrier, settings, onChange, onSave, isSaving,
}: {
  carrier: CarrierSlug;
  settings: LocalSettings;
  onChange: (patch: Partial<LocalSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="text-xs font-semibold text-gray-600">Margin %</Label>
        <Input type="number" min="0" max="200" step="0.1" value={settings.margin_pct} onChange={(e) => onChange({ margin_pct: parseFloat(e.target.value) || 0 })} className="mt-1" />
        <p className="mt-0.5 text-[10px] text-gray-400">Applied to base rate before FSC</p>
      </div>

      <div>
        <Label className="text-xs font-semibold text-gray-600">FSC % (current)</Label>
        <div className="mt-1 flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-mono text-gray-700">
          {settings.fsc_pct > 0 ? `${settings.fsc_pct}%` : "—"}
        </div>
        <p className="mt-0.5 text-[10px] text-gray-400">Edit via FSC history below</p>
      </div>

      <div>
        <Label className="text-xs font-semibold text-gray-600">Demand surcharge</Label>
        <Select value={settings.demand_active ? "true" : "false"} onValueChange={(v) => onChange({ demand_active: v === "true" })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Off</SelectItem>
            <SelectItem value="true">On</SelectItem>
          </SelectContent>
        </Select>
        {settings.demand_active && (
          <div className="mt-2">
            <Label className="text-xs">Per kg (₹)</Label>
            <Input type="number" min="0" step="0.5" value={settings.demand_per_kg} onChange={(e) => onChange({ demand_per_kg: parseFloat(e.target.value) || 0 })} className="mt-1" />
          </div>
        )}
      </div>

      {carrier === "fedex" && (
        <div>
          <Label className="text-xs font-semibold text-gray-600">Peak surcharge</Label>
          <Select value={settings.peak_active ? "true" : "false"} onValueChange={(v) => onChange({ peak_active: v === "true" })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Off</SelectItem>
              <SelectItem value="true">On</SelectItem>
            </SelectContent>
          </Select>
          {settings.peak_active && (
            <div className="mt-2">
              <Label className="text-xs">Peak amount (₹ flat)</Label>
              <Input type="number" min="0" step="1" value={settings.peak_amount ?? 0} onChange={(e) => onChange({ peak_amount: parseFloat(e.target.value) || 0 })} className="mt-1" />
            </div>
          )}
        </div>
      )}

      {carrier === "ups" && (
        <div>
          <Label className="text-xs font-semibold text-gray-600">Surge fee</Label>
          <Select value={settings.surge_active ? "true" : "false"} onValueChange={(v) => onChange({ surge_active: v === "true" })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Off</SelectItem>
              <SelectItem value="true">On</SelectItem>
            </SelectContent>
          </Select>
          {settings.surge_active && (
            <div className="mt-2">
              <Label className="text-xs">Surge amount (₹ flat)</Label>
              <Input type="number" min="0" step="1" value={settings.surge_amount ?? 0} onChange={(e) => onChange({ surge_amount: parseFloat(e.target.value) || 0 })} className="mt-1" />
            </div>
          )}
        </div>
      )}

      <FscHistoryPanel carrier={carrier} />

      <Button onClick={onSave} disabled={isSaving} className="mt-2 w-full">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save All"}
      </Button>
      <p className="text-[10px] text-gray-400 -mt-2 text-center">
        Saves margin + surcharges for {carrier.toUpperCase()}. Affects new quotes immediately.
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminConfig() {
  const { toast }                                        = useToast();
  const { data: surchargeConfig, isLoading: cfgLoading } = useAdminSurchargeConfig();
  const { data: fscRows }                                = useAdminFuelSurcharges();
  const saveAll                                          = useSaveAllSurchargeConfig();

  const [activeCarrier, setActiveCarrier] = useState<CarrierSlug>("dhl");
  const [shipmentType, setShipmentType]   = useState<"document" | "package">("document");
  const [viewMode, setViewMode]           = useState<"base" | "effective">("base");
  const [draft, setDraft]                 = useState<DraftState>(DEFAULT_DRAFT);
  const [hlWeight,     setHlWeight]     = useState<number | null>(null);
  const [hlBandWeight, setHlBandWeight] = useState<number | null>(null);
  const [hlZone,       setHlZone]       = useState<string | null>(null);
  const [calcWeight,   setCalcWeight]   = useState("");
  const [calcCountry,  setCalcCountry]  = useState("");

  // Fetch all 3 carrier rate cards so we can cross-check and auto-switch
  const { data: dhlRateCard,   isLoading: dhlLoading   } = useRateCards("dhl");
  const { data: fedexRateCard, isLoading: fedexLoading } = useRateCards("fedex");
  const { data: upsRateCard,   isLoading: upsLoading   } = useRateCards("ups");

  const allRateCards = { dhl: dhlRateCard, fedex: fedexRateCard, ups: upsRateCard };
  const rateCardData = allRateCards[activeCarrier];
  const rcLoading    = activeCarrier === "dhl" ? dhlLoading : activeCarrier === "fedex" ? fedexLoading : upsLoading;

  // Seed draft from surcharge config
  useEffect(() => {
    if (!surchargeConfig) return;
    setDraft((prev) => {
      const next = { ...prev };
      for (const c of CARRIERS) {
        const cfg = surchargeConfig[c] ?? {};
        next[c] = {
          ...prev[c],
          margin_pct:    typeof cfg.margin_pct    === "number"  ? cfg.margin_pct    : prev[c].margin_pct,
          demand_active: typeof cfg.demand_active === "boolean" ? cfg.demand_active : prev[c].demand_active,
          demand_per_kg: typeof cfg.demand_per_kg === "number"  ? cfg.demand_per_kg : prev[c].demand_per_kg,
          ...(c === "fedex" ? {
            peak_active: typeof cfg.peak_active === "boolean" ? cfg.peak_active : prev[c].peak_active,
            peak_amount: typeof cfg.peak_amount  === "number"  ? cfg.peak_amount  : prev[c].peak_amount,
          } : {}),
          ...(c === "ups" ? {
            surge_active: typeof cfg.surge_active === "boolean" ? cfg.surge_active : prev[c].surge_active,
            surge_amount: typeof cfg.surge_amount  === "number"  ? cfg.surge_amount  : prev[c].surge_amount,
          } : {}),
        };
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surchargeConfig]);

  // Sync active FSC % into draft for live preview
  useEffect(() => {
    if (!fscRows) return;
    const today = new Date().toISOString().split("T")[0];
    for (const c of CARRIERS) {
      const active = (fscRows as AdminFuelSurcharge[])
        .filter((r) => r.carrier_id === c && formatDate(r.effective_from) <= today && (!r.effective_to || formatDate(r.effective_to) >= today))
        .sort((a, b) => formatDate(b.effective_from).localeCompare(formatDate(a.effective_from)))[0];
      if (active) {
        setDraft((prev) => ({ ...prev, [c]: { ...prev[c], fsc_pct: Number(active.fsc_percent) } }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fscRows]);

  // Auto-switch to whichever carrier has rate data for the entered weight + country
  useEffect(() => {
    if (!calcWeight || !calcCountry) return;
    if (carrierHasMatch(calcWeight, calcCountry, activeCarrier, allRateCards[activeCarrier])) return;
    for (const c of CARRIERS) {
      if (c !== activeCarrier && carrierHasMatch(calcWeight, calcCountry, c, allRateCards[c])) {
        setActiveCarrier(c);
        break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcWeight, calcCountry, dhlRateCard, fedexRateCard, upsRateCard, activeCarrier]);

  function patchDraft(patch: Partial<LocalSettings>) {
    setDraft((prev) => ({ ...prev, [activeCarrier]: { ...prev[activeCarrier], ...patch } }));
    if (viewMode === "base") setViewMode("effective");
  }

  async function handleSaveAll() {
    const s = draft[activeCarrier];
    const updates: { key: string; value_num?: number; value_bool?: boolean }[] = [
      { key: "margin_pct",    value_num:  s.margin_pct },
      { key: "demand_active", value_bool: s.demand_active },
      { key: "demand_per_kg", value_num:  s.demand_per_kg },
    ];
    if (activeCarrier === "fedex") {
      updates.push({ key: "peak_active",  value_bool: s.peak_active ?? false });
      updates.push({ key: "peak_amount",  value_num:  s.peak_amount ?? 0 });
    }
    if (activeCarrier === "ups") {
      updates.push({ key: "surge_active", value_bool: s.surge_active ?? false });
      updates.push({ key: "surge_amount", value_num:  s.surge_amount ?? 0 });
    }
    try {
      await saveAll.mutateAsync({ carrier: activeCarrier, updates });
      toast({ title: "Saved", description: `${activeCarrier.toUpperCase()} config updated. New quotes reflect this immediately.` });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  const matrix = useMemo(
    () => buildMatrix(rateCardData?.steps ?? [], shipmentType),
    [rateCardData, shipmentType]
  );
  const bandMatrix = useMemo(
    () => buildBandMatrix(rateCardData?.bands ?? [], shipmentType),
    [rateCardData, shipmentType]
  );
  const countries = rateCardData?.countries ?? [];
  const currentSettings = draft[activeCarrier];

  return (
    <div className="p-4 lg:p-6">
      {/* Header + carrier tabs */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Pricing Config</h1>
        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
          {CARRIERS.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCarrier(c)}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${
                activeCarrier === c ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {c === "dhl" ? "DHL" : c === "fedex" ? "FedEx" : "UPS"}
            </button>
          ))}
        </div>
      </div>

      {cfgLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* ── Left panel ── */}
          <div className="w-full lg:w-64 lg:shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <SurchargePanel
              carrier={activeCarrier}
              settings={currentSettings}
              onChange={patchDraft}
              onSave={handleSaveAll}
              isSaving={saveAll.isPending}
            />
          </div>

          {/* ── Right main ── */}
          <div className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
              <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
                {(["document", "package"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setShipmentType(t)}
                    className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                      shipmentType === t ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {t === "document" ? "Documents" : "Packages"}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs">
                <button
                  onClick={() => setViewMode("base")}
                  className={`px-3 py-1.5 font-medium transition-colors ${viewMode === "base" ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  Base Rate (PDF)
                </button>
                <button
                  onClick={() => setViewMode("effective")}
                  className={`px-3 py-1.5 font-medium transition-colors ${viewMode === "effective" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  Your Price
                </button>
              </div>
            </div>

            <div className="p-4">
              {viewMode === "effective" && (
                <div className="mb-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  Showing base × (1 + {currentSettings.margin_pct}% margin) × (1 + {currentSettings.fsc_pct}% FSC)
                  {currentSettings.demand_active ? ` + ₹${currentSettings.demand_per_kg}/kg demand` : ""} + 18% GST.
                  Changes are live — click Save All to persist.
                </div>
              )}
              {viewMode === "base" && (
                <div className="mb-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  Raw base rates from the carrier PDF. These are what you pay the carrier (before any markup).
                </div>
              )}

              {rcLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <RateCardTable
                    matrix={matrix}
                    settings={currentSettings}
                    viewMode={viewMode}
                    highlightWeight={hlWeight}
                    highlightZone={hlZone}
                  />
                  <BandTable
                    bandMatrix={bandMatrix}
                    settings={currentSettings}
                    viewMode={viewMode}
                    highlightZone={hlZone}
                    highlightChargeable={hlBandWeight}
                  />
                  <RateCalculator
                    matrix={matrix}
                    bandMatrix={bandMatrix}
                    settings={currentSettings}
                    countries={countries}
                    activeCarrier={activeCarrier}
                    weight={calcWeight}
                    country={calcCountry}
                    onWeightChange={setCalcWeight}
                    onCountryChange={setCalcCountry}
                    onSelect={(stepW, chargeableKg, z) => {
                      setHlWeight(stepW);
                      setHlBandWeight(chargeableKg);
                      setHlZone(z);
                    }}
                    onShipmentTypeChange={setShipmentType}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
