import React, { useState } from "react";
import { Sparkles, Clipboard, Check, Zap, Info } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MagicPasteProps {
  onApply: (data: any) => void;
  currentStep: number;
}

const SAMPLE_SHIPPER = {
  senderCompany: "Rahul Sharma",
  senderMobile: "9876543210",
  senderEmail: "rahul.sharma@example.com",
  senderKyc: "ABCDE1234F",
  pickupPincode: "110001",
  pickupAddress1: "123, Connaught Place",
  pickupCity: "New Delhi",
  pickupState: "Delhi",
  pickupSlot: "Morning",
};

const SAMPLE_CONSIGNEE = {
  receiverCompany: "John Doe",
  receiverMobile: "2015550123",
  receiverEmail: "john.doe@example.com",
  deliveryAddress1: "456 Main Street",
  deliveryCity: "New York",
  deliveryState: "NY",
  deliveryZip: "10001",
};

export const MagicPaste: React.FC<MagicPasteProps> = ({ onApply, currentStep }) => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (data: any, label: string) => {
    const formatted = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    navigator.clipboard.writeText(formatted);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const parseText = (raw: string) => {
    try {
      // Try JSON first
      return JSON.parse(raw);
    } catch (e) {
      // Try Key: Value lines
      const result: any = {};
      const lines = raw.split("\n");
      lines.forEach(line => {
        const parts = line.split(/[:=]/);
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join(":").trim();
          if (key && value) result[key] = value;
        }
      });
      return result;
    }
  };

  const handleApply = () => {
    if (!text.trim()) {
      toast.error("Please paste some data first");
      return;
    }
    const parsed = parseText(text);
    if (Object.keys(parsed).length === 0) {
      toast.error("Could not parse any data. Try JSON or Key:Value format.");
      return;
    }
    onApply(parsed);
    setText("");
    toast.success("Magic Fill applied!");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-dashed border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-amber-700 h-8 px-3"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[12px] font-bold uppercase tracking-wider">Magic Fill</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-2xl border-amber-100" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Quick Address Paste
            </h4>
            <div className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-1">
              <Info className="w-2.5 h-2.5" />
              JSON or Key:Value
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] h-7 bg-slate-50 border-slate-200 hover:bg-white"
              onClick={() => handleCopy(SAMPLE_SHIPPER, "Shipper")}
            >
              {copied === "Shipper" ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Clipboard className="w-3 h-3 mr-1" />}
              Copy Shipper
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] h-7 bg-slate-50 border-slate-200 hover:bg-white"
              onClick={() => handleCopy(SAMPLE_CONSIGNEE, "Consignee")}
            >
              {copied === "Consignee" ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Clipboard className="w-3 h-3 mr-1" />}
              Copy Consignee
            </Button>
          </div>

          <Textarea 
            placeholder="Paste address details here..." 
            className="min-h-[120px] text-xs font-mono bg-slate-50 focus-visible:ring-amber-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 shadow-lg shadow-amber-500/20"
            onClick={handleApply}
          >
            Apply Magic Fill
          </Button>
          
          <p className="text-[10px] text-center text-slate-400">
            Paste everything at once and watch it fill!
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
