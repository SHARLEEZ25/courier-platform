import { useState, useEffect } from "react";
import {
  useAdminSurchargeConfig,
  useUpdateSurchargeConfig,
  useAdminFuelSurcharges,
  useAddFuelSurcharge,
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
import { Loader2 } from "lucide-react";
import type { AdminFuelSurcharge } from "@/types/api";

const CARRIERS = ["dhl", "fedex", "ups"] as const;
type CarrierSlug = (typeof CARRIERS)[number];

// Config keys each carrier has
const CARRIER_KEYS: Record<CarrierSlug, string[]> = {
  dhl:   ["margin_pct", "demand_active", "demand_per_kg"],
  fedex: ["margin_pct", "demand_active", "demand_per_kg", "peak_active", "peak_amount"],
  ups:   ["margin_pct", "demand_active", "demand_per_kg", "surge_active", "surge_amount"],
};

const KEY_LABELS: Record<string, string> = {
  margin_pct:    "Margin %",
  demand_active: "Demand surcharge active",
  demand_per_kg: "Demand per kg (₹)",
  peak_active:   "Peak surcharge active (FedEx)",
  peak_amount:   "Peak amount (₹)",
  surge_active:  "Surge active (UPS)",
  surge_amount:  "Surge amount (₹)",
};

const BOOL_KEYS = new Set(["demand_active", "peak_active", "surge_active"]);

function CarrierConfigForm({ carrier, config }: { carrier: CarrierSlug; config: Record<string, number | boolean | null> | undefined }) {
  const { toast }    = useToast();
  const updateConfig = useUpdateSurchargeConfig();
  const keys         = CARRIER_KEYS[carrier];

  const [values, setValues] = useState<Record<string, string | boolean>>({});

  // Seed local state when data loads
  useEffect(() => {
    if (!config) return;
    const initial: Record<string, string | boolean> = {};
    for (const k of keys) {
      const v = config[k];
      if (BOOL_KEYS.has(k)) {
        initial[k] = Boolean(v);
      } else {
        initial[k] = v !== null && v !== undefined ? String(v) : "0";
      }
    }
    setValues(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  async function handleSave(key: string) {
    const val = values[key];
    try {
      if (BOOL_KEYS.has(key)) {
        await updateConfig.mutateAsync({ carrier, key, value_bool: Boolean(val) });
      } else {
        const num = Number(val);
        if (isNaN(num)) { toast({ title: "Invalid number", variant: "destructive" }); return; }
        await updateConfig.mutateAsync({ carrier, key, value_num: num });
      }
      toast({ title: "Saved", description: `${KEY_LABELS[key]} updated for ${carrier.toUpperCase()}` });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-3">
      {keys.map((key) => (
        <div key={key} className="flex items-end gap-3">
          <div className="flex-1">
            <Label className="text-xs">{KEY_LABELS[key]}</Label>
            {BOOL_KEYS.has(key) ? (
              <Select
                value={values[key] === true || values[key] === "true" ? "true" : "false"}
                onValueChange={(v) => setValues((prev) => ({ ...prev, [key]: v === "true" }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Off</SelectItem>
                  <SelectItem value="true">On</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                step="0.01"
                min="0"
                className="mt-1"
                value={String(values[key] ?? "0")}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave(key)}
            disabled={updateConfig.isPending}
            className="mb-0.5 shrink-0"
          >
            {updateConfig.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function AdminConfig() {
  const { toast } = useToast();
  const { data: surchargeConfig, isLoading: cfgLoading } = useAdminSurchargeConfig();
  const { data: fscRows,         isLoading: fscLoading  } = useAdminFuelSurcharges();
  const addFsc = useAddFuelSurcharge();

  const [fscCarrier, setFscCarrier]   = useState<string>("");
  const [fscPct, setFscPct]           = useState("");
  const [fscFrom, setFscFrom]         = useState("");
  const [fscTo, setFscTo]             = useState("");

  const [activeTab, setActiveTab] = useState<CarrierSlug>("dhl");

  async function handleAddFsc(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addFsc.mutateAsync({
        carrier_id:     fscCarrier,
        fsc_percent:    Number(fscPct),
        effective_from: fscFrom,
        effective_to:   fscTo || undefined,
      });
      toast({ title: "Fuel surcharge added" });
      setFscPct(""); setFscFrom(""); setFscTo("");
    } catch (err) {
      toast({ title: "Failed to add FSC", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Config</h1>

      {/* Surcharge Config */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Surcharge Config</h2>
          <p className="text-xs text-gray-400">Changes apply to new quotes immediately. Existing bookings are unaffected.</p>
        </div>

        {/* Carrier Tabs */}
        <div className="flex border-b border-gray-100">
          {CARRIERS.map((c) => (
            <button
              key={c}
              onClick={() => setActiveTab(c)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === c
                  ? "border-b-2 border-blue-600 text-blue-700"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="p-4">
          {cfgLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <CarrierConfigForm
              carrier={activeTab}
              config={surchargeConfig?.[activeTab]}
            />
          )}
        </div>
      </div>

      {/* Fuel Surcharges */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Fuel Surcharges (FSC)</h2>
          <p className="text-xs text-gray-400">Updated monthly. Add a new row — the rate active today is always used for quotes.</p>
        </div>

        {/* FSC table */}
        <div className="overflow-x-auto">
          {fscLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2.5">Carrier</th>
                  <th className="px-4 py-2.5 text-right">FSC %</th>
                  <th className="px-4 py-2.5">Effective From</th>
                  <th className="px-4 py-2.5">Effective To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(fscRows ?? []).map((row: AdminFuelSurcharge) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2 uppercase font-medium text-gray-700">{row.carrier_id}</td>
                    <td className="px-4 py-2 text-right font-mono">{row.fsc_percent}%</td>
                    <td className="px-4 py-2 text-gray-500">{row.effective_from}</td>
                    <td className="px-4 py-2 text-gray-400">{row.effective_to ?? "—"}</td>
                  </tr>
                ))}
                {!fscLoading && (fscRows?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400">No FSC entries</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Add FSC form */}
        <div className="border-t border-gray-100 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Add New FSC Row</h3>
          <form onSubmit={handleAddFsc} className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">Carrier *</Label>
              <Select value={fscCarrier} onValueChange={setFscCarrier} required>
                <SelectTrigger className="mt-1 w-28">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dhl">DHL</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="aramex">Aramex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">FSC % *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 27.50"
                value={fscPct}
                onChange={(e) => setFscPct(e.target.value)}
                className="mt-1 w-28"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Effective From *</Label>
              <Input
                type="date"
                value={fscFrom}
                onChange={(e) => setFscFrom(e.target.value)}
                className="mt-1 w-36"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Effective To (optional)</Label>
              <Input
                type="date"
                value={fscTo}
                onChange={(e) => setFscTo(e.target.value)}
                className="mt-1 w-36"
              />
            </div>
            <Button
              type="submit"
              disabled={addFsc.isPending || !fscCarrier || !fscPct || !fscFrom}
              className="mb-0.5"
            >
              {addFsc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add FSC"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
