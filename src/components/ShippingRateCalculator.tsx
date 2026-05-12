import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDestinations } from "@/hooks/useDestinations";
import { Check, ChevronsUpDown, ChevronDown, MapPin, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const itemTypes = [
  { label: "Document & Parcels", value: "docs" },
  { label: "University Express", value: "university", note: "Save more than 50% on university documents worldwide" },
  { label: "Clothing", value: "clothing" },
  { label: "Food Products Express", value: "food", note: "Special rates for parents sending food & essentials to children studying abroad" },
  { label: "Medicines", value: "medicine", note: "Note: Prescription copy may be required at customs" },
  { label: "Jewellery", value: "jewellery" },
  { label: "Electronics", value: "electronics", note: "Note: May require customs declaration at destination" },
  { label: "Cosmetics", value: "cosmetics" },
  { label: "Gifts / Personal effects", value: "gifts" },
  { label: "Sports equipment", value: "sports" },
  { label: "Pooja / Religious items", value: "pooja" },
  { label: "Excess Baggage Express", value: "excess", note: "Save more than 50% vs airline excess baggage fees" },
  { label: "Commercial goods", value: "commercial" },
  { label: "Other", value: "other" },
];

interface ShippingRateCalculatorProps {
  variant?: "sidebar" | "horizontal" | "compact";
  onCalculate: (data: { origin: string; destination: string; weight: number; itemType: string }) => void;
  initialData?: { origin: string; destination: string; weight: number; itemType: string };
}

const ShippingRateCalculator: React.FC<ShippingRateCalculatorProps> = ({ variant = "sidebar", onCalculate, initialData }) => {
  const { data: countries = [] } = useDestinations();
  const isSidebar = variant === "sidebar";
  const isHorizontal = variant === "horizontal";
  const isCompact = variant === "compact";
  const [openDest, setOpenDest] = useState(false);
  const origin = "India";
  const [destination, setDestination] = useState(initialData?.destination || "");
  const [weight, setWeight] = useState(initialData?.weight?.toString() || "2.5");
  const [itemType, setItemType] = useState(initialData?.itemType || "");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setDestination(initialData.destination);
      setWeight(initialData.weight.toString());
      setItemType(initialData.itemType);
    }
  }, [initialData]);

  const selectedItem = useMemo(() => itemTypes.find(i => i.value === itemType), [itemType]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!destination) newErrors.destination = "Please select destination";
    const w = parseFloat(weight);
    if (!weight || w <= 0) newErrors.weight = "Invalid weight";
    else if (w > 3000) newErrors.weight = "Total weight cannot exceed 3,000 kg (DHL limit)";
    if (!itemType) newErrors.itemType = "Select item type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (validate()) {
      onCalculate({ origin, destination, weight: parseFloat(weight), itemType });

      // Scroll to top to focus on results since hero is being replaced
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 150);
    }
  };

  const Content = (
    <div className={cn(
      "bg-white rounded-2xl border-[0.5px] border-card-border shadow-sm overflow-hidden",
      isSidebar ? "p-4 space-y-3" : "p-8 md:p-10 max-w-3xl mx-auto"
    )}>
      <div className={cn("grid", isSidebar ? "grid-cols-1 gap-3" : "grid-cols-1 md:grid-cols-2 gap-5")}>
        {/* Origin — locked to India */}
        <div className="space-y-1">
          <label className={cn("font-bold text-brand-black uppercase tracking-wider", isSidebar ? "text-[10px]" : "text-xs")}>From</label>
          <div className={cn("w-full flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 cursor-not-allowed", isSidebar ? "h-10" : "h-12")}>
            <MapPin className="w-4 h-4 text-green-primary shrink-0" />
            <span className={cn("font-semibold text-brand-black", isSidebar ? "text-xs" : "text-sm")}>India</span>
            <span className={cn("ml-auto text-gray-400", isSidebar ? "text-[9px]" : "text-[10px]")}>Outbound only</span>
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-1">
          <label className={cn("font-bold text-brand-black uppercase tracking-wider", isSidebar ? "text-[10px]" : "text-xs")}>To</label>
          <Popover open={openDest} onOpenChange={setOpenDest}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between font-normal", isSidebar ? "h-10 text-xs" : "h-12", errors.destination && "border-red-500")}
              >
                {destination || "Select Destination"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 shadow-2xl border-slate-200 rounded-xl overflow-hidden">
              <Command className="rounded-none border-none">
                <div className="flex items-center border-b border-slate-100 px-4 bg-white transition-colors">
                  <SearchIcon className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                  <CommandPrimitive.Input
                    placeholder="Search destination..."
                    className="flex h-12 w-full bg-transparent py-3 text-[14px] outline-none placeholder:text-slate-400 border-none focus:ring-0"
                  />
                </div>
                <CommandList className="max-h-[300px] w-full scrollbar-thin">
                  <CommandEmpty className="py-10 text-xs text-slate-400 text-center flex flex-col items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-200" />
                    No country found.
                  </CommandEmpty>
                  <CommandGroup className="p-2">
                    {countries.map((c) => (
                      <CommandItem
                        key={c}
                        value={c}
                        onSelect={() => {
                          setDestination(c);
                          setOpenDest(false);
                        }}
                        className="py-2.5 px-4 rounded-lg cursor-pointer data-[selected='true']:!bg-green-50 data-[selected='true']:!text-green-primary transition-all mb-0.5 last:mb-0 group/item flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className={cn("w-3.5 h-3.5", destination === c ? "text-green-primary" : "text-slate-400")} />
                          <span className="font-semibold text-[13px]">{c}</span>
                        </div>
                        {destination === c && <Check className="h-3 w-3 text-green-primary" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.destination && <p className="text-[10px] text-red-500">{errors.destination}</p>}
        </div>

        {/* Weight */}
        <div className="space-y-1">
          <label className={cn("font-bold text-brand-black uppercase tracking-wider", isSidebar ? "text-[10px]" : "text-xs")}>Weight (kg)</label>
          <Input
            type="number"
            placeholder="e.g. 2.5"
            className={cn(errors.weight && "border-red-500", isSidebar ? "h-10 text-xs" : "h-12")}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          {errors.weight && <p className="text-[10px] text-red-500">{errors.weight}</p>}
        </div>

        {/* Item Type */}
        <div className="space-y-1">
          <label className={cn("font-bold text-brand-black uppercase tracking-wider", isSidebar ? "text-[10px]" : "text-xs")}>Item Type</label>
          <Select onValueChange={setItemType} value={itemType}>
            <SelectTrigger className={cn(errors.itemType && "border-red-500", isSidebar ? "h-10 text-xs" : "h-12")}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {itemTypes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.itemType && <p className="text-[10px] text-red-500">{errors.itemType}</p>}
        </div>

      </div>

      <Button
        onClick={handleCalculate}
        className={cn(
          "w-full bg-green-primary hover:bg-green-dark text-white rounded-xl font-bold transition-all shadow-md shadow-green-50",
          isSidebar ? "mt-4 h-11 text-xs" : "mt-6 h-12 text-sm"
        )}
      >
        Calculate My Rate
      </Button>

      {selectedItem?.note && !isSidebar && (
        <p className="text-[11px] text-brand-gray mt-4 text-center italic">{selectedItem.note}</p>
      )}
    </div>
  );

  if (isHorizontal) {
    return (
      <div className="w-full max-w-[1020px] mx-auto relative">
        <div className="bg-white p-1 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-stretch relative z-10">

          {/* From — locked to India */}
          <div className="flex-1 min-w-0 px-3 py-2 rounded-l-xl flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block text-center">From</label>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-green-primary shrink-0" />
              <span className="font-extrabold text-[#111827] text-[14px]">India</span>
              <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">only</span>
            </div>
          </div>

          <div className="w-[1px] h-10 bg-gray-100 my-auto" />

          {/* To */}
          <div className="flex-1 min-w-0 px-3 py-2 hover:bg-gray-50/50 transition-colors relative group flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block text-center">To</label>
            <Popover open={openDest} onOpenChange={setOpenDest}>
              <PopoverTrigger asChild>
                <div className="flex items-center justify-center gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="font-extrabold text-[#111827] text-[14px] truncate">
                      {destination || "Destination"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300 transition-colors" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] p-0 shadow-2xl border-slate-200 rounded-xl overflow-hidden" align="start" sideOffset={8}>
                <Command className="rounded-none w-full border-none">
                  <div className="flex items-center border-b border-slate-100 px-4 bg-white transition-colors">
                    <SearchIcon className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                    <CommandPrimitive.Input
                      placeholder="Search destination..."
                      className="flex h-12 w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-slate-400 border-none focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <CommandList className="max-h-[320px] w-full scrollbar-thin">
                    <CommandEmpty className="py-10 text-sm text-slate-400 text-center flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-slate-200" />
                      </div>
                      No country found
                    </CommandEmpty>
                    <CommandGroup className="p-2">
                      {countries.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={() => { setDestination(c); setOpenDest(false); }}
                          className="py-3 px-4 rounded-lg cursor-pointer data-[selected='true']:!bg-green-50 data-[selected='true']:!text-green-primary transition-all mb-1 last:mb-0 group/item flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                              destination === c ? "bg-green-100 text-green-primary" : "bg-slate-50 text-slate-400 group-hover/item:bg-green-50 group-hover/item:text-green-primary"
                            )}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-[14px] text-slate-700 group-hover/item:text-green-primary transition-colors">
                              {c}
                            </span>
                          </div>
                          {destination === c && (
                            <div className="w-5 h-5 rounded-full bg-green-primary flex items-center justify-center animate-in zoom-in-50">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.destination && <p className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] text-red-500 font-bold uppercase">{errors.destination}</p>}
          </div>

          <div className="w-[1px] h-10 bg-gray-100 my-auto" />

          {/* Weight */}
          <div className="flex-[0.6] min-w-0 px-3 py-2 hover:bg-gray-50/50 transition-colors relative group flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block text-center">Weight</label>
            <div className="flex items-baseline justify-center gap-1">
              <input
                type="number"
                placeholder="2.5"
                className="w-12 bg-transparent border-0 p-0 text-[18px] font-extrabold text-[#111827] focus:ring-0 placeholder:text-gray-200 text-center"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="text-[9px] font-black text-gray-400">KG</span>
            </div>
            {errors.weight && <p className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] text-red-500 font-bold uppercase">{errors.weight}</p>}
          </div>

          <div className="w-[1px] h-10 bg-gray-100 my-auto" />

          {/* Category */}
          <div className="flex-[1.2] min-w-0 px-3 py-2 hover:bg-gray-50/50 transition-colors relative group flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block text-center">Item Type</label>
            <Select onValueChange={setItemType} value={itemType}>
              <SelectTrigger className="w-full border-0 bg-transparent p-0 h-auto font-extrabold text-[#111827] text-[14px] focus:ring-0 ring-0 shadow-none flex justify-center gap-1.5">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="py-2.5 font-medium text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemType && <p className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] text-red-500 font-bold uppercase">{errors.itemType}</p>}
          </div>

          <div className="p-1 flex items-center">
            <Button
              onClick={handleCalculate}
              className="h-11 px-8 bg-green-primary hover:bg-green-dark text-white font-black uppercase tracking-widest text-[13px] rounded-xl shadow-[0_8px_20px_rgba(76,175,80,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] min-w-[120px]"
            >
              SEARCH →
            </Button>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-10">
          {[
            { label: "Transparent Pricing", icon: Check },
            { label: "Real-time Tracking", icon: Check },
            { label: "Worldwide Network", icon: Check }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <item.icon className="w-4 h-4 text-green-primary" /> {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-[60] py-2">
        <div className="container max-w-7xl">
          <div className="flex flex-row items-center gap-2 md:gap-4 h-11">
            {/* Minimal Origin — locked to India */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-100 bg-gray-50/50 overflow-hidden">
                <MapPin className="w-3 h-3 text-green-primary shrink-0" />
                <span className="font-bold text-[#111827] text-xs">India</span>
                <span className="text-[9px] text-gray-300 font-bold uppercase ml-1">only</span>
              </div>
            </div>

            {/* Minimal To */}
            <div className="flex-1 min-w-0">
              <Popover open={openDest} onOpenChange={setOpenDest}>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer h-9 px-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white transition-all overflow-hidden group">
                    <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="font-bold text-[#111827] text-xs truncate">
                      {destination || "Destination"}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 shadow-2xl border-slate-200 rounded-xl overflow-hidden" align="start" sideOffset={8}>
                  <Command className="rounded-none w-full border-none">
                    <div className="flex items-center border-b border-slate-100 px-4 bg-white">
                      <SearchIcon className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                      <CommandPrimitive.Input
                        placeholder="Search destination..."
                        className="flex h-10 w-full bg-transparent py-2 text-xs outline-none placeholder:text-slate-400 border-none focus:ring-0"
                      />
                    </div>
                    <CommandList className="max-h-[250px] w-full scrollbar-thin">
                      <CommandGroup className="p-1">
                        {countries.map((c) => (
                          <CommandItem
                            key={c}
                            value={c}
                            onSelect={() => { setDestination(c); setOpenDest(false); }}
                            className="py-2 px-3 rounded-md cursor-pointer data-[selected='true']:bg-green-50 data-[selected='true']:text-green-primary text-xs flex justify-between"
                          >
                            <span>{c}</span>
                            {destination === c && <Check className="h-3 w-3 text-green-primary" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Weight */}
            <div className="flex-[0.5] min-w-[70px]">
              <div className="flex items-center h-9 px-3 rounded-lg border border-gray-100 bg-gray-50/50">
                <input
                  type="number"
                  placeholder="2.5"
                  className="w-full bg-transparent border-0 p-0 text-xs font-bold text-[#111827] focus:ring-0 placeholder:text-gray-300"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <span className="text-[10px] font-bold text-gray-400 ml-1">KG</span>
              </div>
            </div>

            {/* Type */}
            <div className="flex-[0.8] min-w-[120px] hidden sm:block">
              <Select onValueChange={setItemType} value={itemType}>
                <SelectTrigger className="h-9 border-gray-100 bg-gray-50/50 text-xs font-bold px-3">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-xs">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <Button
              onClick={handleCalculate}
              className="h-9 px-4 bg-green-primary hover:bg-green-dark text-white font-black uppercase tracking-widest text-[10px] rounded-lg shadow-sm"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isSidebar) return Content;

  return (
    <section id="quote-section" className="py-20 bg-light-bg scroll-mt-20">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mb-4 tracking-tight">Get an Instant Shipping Rate</h2>
          <p className="text-lg text-brand-gray">No signup needed. Enter your details and get a price in seconds.</p>
        </div>
        {Content}
      </div>
    </section>
  );
};

export default ShippingRateCalculator;
