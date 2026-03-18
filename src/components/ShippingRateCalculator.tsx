import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const countries = [
  { label: "India", value: "India" },
  { label: "United States", value: "USA" },
  { label: "Canada", value: "Canada" },
  { label: "United Kingdom", value: "UK" },
  { label: "Australia", value: "Australia" },
  { label: "New Zealand", value: "New Zealand" },
  { label: "United Arab Emirates", value: "UAE" },
  { label: "Saudi Arabia", value: "Saudi Arabia" },
  { label: "Qatar", value: "Qatar" },
  { label: "Kuwait", value: "Kuwait" },
  { label: "Bahrain", value: "Bahrain" },
  { label: "Oman", value: "Oman" },
  { label: "Singapore", value: "Singapore" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Hong Kong", value: "Hong Kong" },
  { label: "Thailand", value: "Thailand" },
  { label: "Japan", value: "Japan" },
  { label: "South Korea", value: "South Korea" },
  { label: "China", value: "China" },
  { label: "Germany", value: "Germany" },
  { label: "France", value: "France" },
  { label: "Netherlands", value: "Netherlands" },
  { label: "Italy", value: "Italy" },
  { label: "Spain", value: "Spain" },
  { label: "Switzerland", value: "Switzerland" },
  { label: "Belgium", value: "Belgium" },
  { label: "Austria", value: "Austria" },
  { label: "Sweden", value: "Sweden" },
  { label: "Norway", value: "Norway" },
  { label: "Denmark", value: "Denmark" },
  { label: "Ireland", value: "Ireland" },
  { label: "Portugal", value: "Portugal" },
  { label: "South Africa", value: "South Africa" },
  { label: "Nigeria", value: "Nigeria" },
  { label: "Kenya", value: "Kenya" },
  { label: "Brazil", value: "Brazil" },
];

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
  const isSidebar = variant === "sidebar";
  const isHorizontal = variant === "horizontal";
  const isCompact = variant === "compact";
  const [openDest, setOpenDest] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
    if (!weight || parseFloat(weight) <= 0) newErrors.weight = "Invalid weight";
    if (!itemType) newErrors.itemType = "Select item type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (validate()) {
      setIsSearching(true);
      onCalculate({ origin, destination, weight: parseFloat(weight), itemType });

      // Reset searching after animation duration
      setTimeout(() => setIsSearching(false), 2000);

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
                {destination ? countries.find(c => c.value === destination)?.label : "Select Destination"}
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
                        key={c.value}
                        value={c.label}
                        onSelect={() => {
                          setDestination(c.value);
                          setOpenDest(false);
                        }}
                        className="py-2.5 px-4 rounded-lg cursor-pointer data-[selected='true']:!bg-green-50 data-[selected='true']:!text-green-primary transition-all mb-0.5 last:mb-0 group/item flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className={cn("w-3.5 h-3.5", destination === c.value ? "text-green-primary" : "text-slate-400")} />
                          <span className="font-semibold text-[13px]">{c.label}</span>
                        </div>
                        {destination === c.value && <Check className="h-3 w-3 text-green-primary" />}
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

  // --- Notion-style mascot animation state ---
  const [jetPhase, setJetPhase] = useState<"idle" | "speak" | "nudge" | "reset">("idle");
  const [showJetBubble, setShowJetBubble] = useState(false);
  const [jetMsgIdx, setJetMsgIdx] = useState(0);
  const [showCourierBubble, setShowCourierBubble] = useState(false);
  const [courierMsgIdx, setCourierMsgIdx] = useState(0);
  const [isEntryDone, setIsEntryDone] = useState(false);

  const jetMessages = [
    "Choose your destination below",
    "Then hit Search for prices!"
  ];
  const courierMessages = [
    "Want an instant quote? 💰",
    "Fill the simple form below ↓"
  ];

  // Typewriter inline component
  const TypewriterText = ({ text, speed = 40 }: { text: string; speed?: number }) => {
    const [display, setDisplay] = useState("");
    useEffect(() => {
      setDisplay("");
      let i = 0;
      const timer = setInterval(() => {
        setDisplay(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(timer);
      }, speed);
      return () => clearInterval(timer);
    }, [text]);
    return <span>{display}</span>;
  };

  // Unified mascot animation loop (Starts AFTER landing)
  useEffect(() => {
    if (!isHorizontal || isSearching || !isEntryDone) return;

    let isMounted = true;

    const runCycle = async () => {
      if (!isMounted) return;

      // Reset states
      setShowJetBubble(false);
      setShowCourierBubble(false);

      // 1. Jet speaks first message
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      setJetMsgIdx(0);
      setShowJetBubble(true);

      // 2. Wait, then switch to second jet message
      await new Promise(r => setTimeout(r, 4000));
      if (!isMounted) return;
      setShowJetBubble(false); // Hide briefly for smooth reset
      await new Promise(r => setTimeout(r, 300));
      if (!isMounted) return;
      setJetMsgIdx(1);
      setShowJetBubble(true);

      // 3. Wait, then hide jet and show courier (First message)
      await new Promise(r => setTimeout(r, 4000));
      if (!isMounted) return;
      setShowJetBubble(false);
      await new Promise(r => setTimeout(r, 800));
      if (!isMounted) return;
      setCourierMsgIdx(0);
      setShowCourierBubble(true);
      
      // 4. Wait, then switch to second courier message
      await new Promise(r => setTimeout(r, 4000));
      if (!isMounted) return;
      setShowCourierBubble(false);
      await new Promise(r => setTimeout(r, 300));
      if (!isMounted) return;
      setCourierMsgIdx(1);
      setShowCourierBubble(true);
      
      // 5. Wait, then reset courier
      await new Promise(r => setTimeout(r, 4000));
      if (!isMounted) return;
      setShowCourierBubble(false);
    };

    runCycle();
    const interval = setInterval(runCycle, 16000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isHorizontal, isSearching, isEntryDone]);


  if (isHorizontal) {
    return (
      <div className="w-full max-w-[1020px] mx-auto relative">
        {/* === Notion-Style Mascot Layer === */}
        <div className="absolute inset-x-0 top-[-70px] h-[90px] pointer-events-none z-30">

          {/* ✈️ Navigator Jet — Left, faces right → "International" */}
          <motion.div
            initial={{ x: -40, y: 20, rotate: -10, opacity: 0, scale: 0.8 }}
            animate={isSearching ? {
              x: [0, 1300],
              y: [0, -80],
              rotate: [0, 12],
              opacity: [1, 1, 0]
            } : {
              x: 0,
              y: isEntryDone ? [0, -5, 0] : 0,
              rotate: 0,
              opacity: 1,
              scale: 1
            }}
            onAnimationComplete={(definition: any) => {
              if (definition.opacity === 1 && !isSearching) {
                setIsEntryDone(true);
              }
            }}
            transition={isSearching ? {
              duration: 1.5,
              ease: [0.4, 0, 0.2, 1],
            } : {
              y: isEntryDone ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" } : { duration: 1, ease: "easeOut" },
              x: { duration: 1, ease: "easeOut" },
              rotate: { duration: 1, ease: "easeOut" },
              scale: { duration: 1, ease: "easeOut" },
              opacity: { duration: 0.8 }
            }}
            className="absolute left-[12px] bottom-[-14px] w-40 h-40 flex items-end"
          >

            {/* Speech bubble */}
            <AnimatePresence>
              {showJetBubble && !isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute -top-9 left-4 bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-1.5 whitespace-nowrap"
                >
                  <span className="text-[11px] font-bold text-gray-800">
                    <TypewriterText text={jetMessages[jetMsgIdx]} speed={45} />
                  </span>
                  {/* Bubble tail */}
                  <div className="absolute left-4 -bottom-[7px] w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>

            <img
              src="/Gemini_Generated_Image_11osmg11osmg11os-removebg-preview.png"
              alt="Navigator Jet"
              className="w-full h-full object-contain"
              style={{
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))",
                transform: "rotate(-40deg) translateX(-8px)",
                transformOrigin: "bottom center"
              }}
            />
          </motion.div>

          {/* 📦 Evaluator Courier — Right, points to "Business" */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1 }}
            transition={{ opacity: { duration: 0.5 } }}
            className="absolute -right-6 bottom-[-14px] w-32 h-36"
          >
            {/* Speech bubble */}
            <AnimatePresence>
              {showCourierBubble && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="absolute -top-9 right-2 bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-1.5 whitespace-nowrap"
                >
                  <span className="text-[11px] font-bold text-gray-800">
                    <TypewriterText text={courierMessages[courierMsgIdx]} speed={45} />
                  </span>
                  {/* Bubble tail */}
                  <div className="absolute right-4 -bottom-[7px] w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>



            <img
              src="/Gemini_Generated_Image_ficrl8ficrl8ficr-removebg-preview.png"
              alt="Evaluator Courier"
              className="w-full h-full object-contain"
              style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))" }}
            />
          </motion.div>
        </div>

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
                          key={c.value}
                          value={c.label}
                          onSelect={() => { setDestination(c.value); setOpenDest(false); }}
                          className="py-3 px-4 rounded-lg cursor-pointer data-[selected='true']:!bg-green-50 data-[selected='true']:!text-green-primary transition-all mb-1 last:mb-0 group/item flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                              destination === c.value ? "bg-green-100 text-green-primary" : "bg-slate-50 text-slate-400 group-hover/item:bg-green-50 group-hover/item:text-green-primary"
                            )}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-[14px] text-slate-700 group-hover/item:text-green-primary transition-colors">
                              {c.label}
                            </span>
                          </div>
                          {destination === c.value && (
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
                            key={c.value}
                            value={c.label}
                            onSelect={() => { setDestination(c.value); setOpenDest(false); }}
                            className="py-2 px-3 rounded-md cursor-pointer data-[selected='true']:bg-green-50 data-[selected='true']:text-green-primary text-xs flex justify-between"
                          >
                            <span>{c.label}</span>
                            {destination === c.value && <Check className="h-3 w-3 text-green-primary" />}
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
