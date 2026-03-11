import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, Check, CheckCircle2, ArrowRight } from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const COUNTRIES = [
  "Australia","Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua","Argentina","Armenia","Aruba","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Barbuda","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bonaire","Bosnia-Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Canary Islands","Cape Verde","Caribbean Netherlands","Cayman Islands","Central African Republic","Chad","Channel Islands","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Cook Islands","Costa Rica","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","England","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Faeroe Islands","Falkland Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Grand Cayman","Great Britain","Great Thatch Islands","Great Tobago Islands","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guinea","Guinea Bissau","Guyana","Haiti","Heard and McDonald Islands","Holland","Honduras","Hong Kong","Hungary","Iceland","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Jost Van Dyke Islands","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar / Burma","Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","Norman Island","North Korea","Northern Ireland","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Rota","Russia","Rwanda","Saba","Saipan","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Scotland","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovak Republic","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and South Sandwich Islands","South Korea","Spain","Sri Lanka","St. Barthelemy","St. Christopher","St. Eustatius","St. Helena","St. John","St. Kitts and Nevis","St. Lucia","St. Maarten (Dutch Control)","St. Martin (French Control)","St. Pierre","St. Thomas","St. Vincent","St. Croix Island","Sudan","Suriname","Svalbard and Jan Mayen Island","Swaziland","Sweden","Switzerland","Syria","Tahiti","Taiwan","Tajikistan","Tanzania","Thailand","Tinian","Togo","Tokelau","Tonga","Tortola Island","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","U.S. Minor Outlying Islands","U.S. Virgin Islands","Uganda","Ukraine","Union Island","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Wales","Wallis and Futuna Islands","Western Sahara","Yemen","Zambia","Zimbabwe"
];

const COUNTRY_CODES = [
  { flag: "🇮🇳", code: "+91", country: "India" },
  { flag: "🇺🇸", code: "+1", country: "USA" },
  { flag: "🇬🇧", code: "+44", country: "UK" },
  { flag: "🇦🇺", code: "+61", country: "Australia" },
  { flag: "🇨🇦", code: "+1", country: "Canada" },
  { flag: "🇦🇪", code: "+971", country: "UAE" },
  { flag: "🇸🇬", code: "+65", country: "Singapore" },
];

const SAMPLE_RATES = [
  { flag: "🇺🇸", country: "USA", rate: "₹800–₹850/kg", days: "2–5 days" },
  { flag: "🇬🇧", country: "UK", rate: "₹750–₹800/kg", days: "3–5 days" },
  { flag: "🇦🇺", country: "Australia", rate: "₹900–₹950/kg", days: "4–6 days" },
  { flag: "🇨🇦", country: "Canada", rate: "₹750–₹850/kg", days: "3–6 days" },
  { flag: "🌏", country: "Singapore/UAE", rate: "₹500–₹600/kg", days: "2–4 days" },
];

// ── Searchable Country Dropdown ──────────────────────────────────────────────
const CountrySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  const select = useCallback((country: string) => {
    onChange(country);
    setQuery(country);
    setOpen(false);
  }, [onChange]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!COUNTRIES.includes(query)) setQuery(value);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [query, value]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]); }
    else if (e.key === "Escape") setOpen(false);
  };

  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  const inputClass = "w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.12)] transition-all";

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className={inputClass}
        placeholder="Search or select a country..."
        value={query}
        onFocus={() => { setOpen(true); setHighlighted(0); }}
        onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-[4px] bg-white border border-[#E5E7EB] rounded-[8px] overflow-y-auto"
          style={{ maxHeight: "240px", scrollbarWidth: "thin", scrollbarColor: "#C8E6C9 transparent" }}
        >
          {filtered.length === 0 ? (
            <li className="px-[16px] py-[12px] text-[13px] text-[#9CA3AF]">No countries found</li>
          ) : (
            filtered.map((country, i) => (
              <li
                key={country}
                onMouseDown={() => select(country)}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex items-center justify-between px-[16px] py-[10px] text-[14px] cursor-pointer transition-colors ${
                  i === highlighted ? "bg-[#F1F8F1]" : ""
                } ${value === country ? "bg-[#E8F5E9] text-[#2E7D32]" : "text-[#374151]"}`}
              >
                {country}
                {value === country && <Check className="w-[14px] h-[14px] text-[#4CAF50]" />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

// ── Country Code Dropdown ────────────────────────────────────────────────────
const CodeSelect = ({ value, onChange }: { value: (typeof COUNTRY_CODES)[0]; onChange: (v: (typeof COUNTRY_CODES)[0]) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-[6px] bg-[#F9FAFB] border-r border-[#E5E7EB] px-[12px] h-full rounded-l-[8px] text-[13px] font-medium text-[#374151] whitespace-nowrap"
      >
        {value.flag} {value.code}
        <span className="text-[#9CA3AF] text-[10px]">▾</span>
      </button>
      {open && (
        <ul className="absolute z-50 top-full left-0 mt-[4px] bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden min-w-[160px]" style={{ boxShadow: "none" }}>
          {COUNTRY_CODES.map(c => (
            <li
              key={c.country}
              onMouseDown={() => { onChange(c); setOpen(false); }}
              className={`flex items-center gap-[8px] px-[12px] py-[9px] text-[13px] cursor-pointer hover:bg-[#F1F8F1] text-[#374151] ${value.country === c.country ? "bg-[#E8F5E9] text-[#2E7D32]" : ""}`}
            >
              {c.flag} {c.code} <span className="text-[#9CA3AF]">({c.country})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const GetQuote = () => {
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">("idle");
  const [destination, setDestination] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    setTimeout(() => setFormStatus("success"), 1500);
  };

  const inputClass = "w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.12)] transition-all";
  const labelClass = "block text-[13px] font-medium text-[#374151] mb-[6px]";

  return (
    <div className="min-h-screen bg-white font-sans text-[#0D0D0D]">
      <TopBar />
      <Navbar />

      <main>
        {/* SECTION 1 — HERO */}
        <section className="bg-white pt-[64px] pb-[72px] max-md:pt-[48px] max-md:pb-[48px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="text-[12px] font-medium text-[#9CA3AF] mb-[12px]">
                Home <span className="mx-1">›</span><span className="text-[#374151]">Get Quote</span>
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">SHIPPING RATES</p>
              <h1 className="text-[36px] md:text-[48px] font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.03em] max-w-[500px]">
                Get your free<br />shipping quote.
              </h1>
              <p className="text-[16px] text-[#6B7280] leading-[1.75] max-w-[440px] mt-[16px]">
                Enter your destination, weight, and details below. We'll get back to you with the best available rate.
              </p>
              <div className="flex flex-wrap items-center gap-[8px] mt-[28px]">
                {["No signup required", "Free estimate", "Fast response"].map((item, i) => (
                  <span key={item} className="flex items-center gap-[6px]">
                    {i > 0 && <span className="text-[#D1D5DB] mx-[4px]">·</span>}
                    <span className="flex items-center gap-[6px] text-[13px] font-medium text-[#374151]">
                      <span className="w-[6px] h-[6px] rounded-full bg-[#4CAF50] inline-block" />
                      {item}
                    </span>
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 — FORM + SIDEBAR */}
        <section className="bg-white pb-[100px] max-md:pb-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="flex flex-col lg:flex-row items-start gap-[64px]">

              {/* LEFT — FORM */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full lg:w-[60%] shrink-0"
              >
                <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[28px] md:p-[40px]">

                  {formStatus === "success" ? (
                    <div className="flex flex-col items-center text-center py-[32px]">
                      <div className="w-[56px] h-[56px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
                        <CheckCircle2 className="w-[32px] h-[32px] text-[#4CAF50]" />
                      </div>
                      <h3 className="text-[20px] font-bold text-[#0D0D0D] mt-[16px]">Quote Request Received!</h3>
                      <p className="text-[14px] text-[#6B7280] leading-[1.7] mt-[8px] max-w-[320px]">
                        Our team will review your details and get back to you shortly with the best available rate.
                      </p>
                      <p className="text-[13px] font-semibold text-[#4CAF50] mt-[16px]">
                        For urgent quotes, call us directly:<br />
                        +91 9600879666 or +91 9380839266
                      </p>
                      <button
                        onClick={() => setFormStatus("idle")}
                        className="border border-[#4CAF50] text-[#4CAF50] hover:bg-[#F1F8F1] rounded-[8px] px-[24px] py-[11px] text-[14px] font-semibold transition-colors mt-[24px]"
                      >
                        Submit Another Quote
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>

                      {/* GROUP 1 */}
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[28px]">SHIPMENT DETAILS</div>

                      <div className="grid md:grid-cols-2 gap-[20px] mb-[28px]">
                        {/* From */}
                        <div>
                          <label className={labelClass}>From</label>
                          <div className="relative">
                            <input
                              type="text"
                              value="🇮🇳 India"
                              readOnly
                              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] text-[#374151] cursor-not-allowed outline-none"
                            />
                          </div>
                          <p className="text-[12px] text-[#9CA3AF] mt-[6px]">All shipments originate from India.</p>
                        </div>

                        {/* To */}
                        <div>
                          <label className={labelClass}>To — Destination Country</label>
                          <CountrySelect value={destination} onChange={setDestination} />
                        </div>
                      </div>

                      {/* Weight */}
                      <div>
                        <label className={labelClass}>Approximate Weight (kg)</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="e.g. 2.5"
                          className={inputClass}
                        />
                        <p className="text-[12px] text-[#9CA3AF] mt-[6px]">Enter the total weight of your shipment in kilograms.</p>
                      </div>

                      <div className="h-px bg-[#E5E7EB] my-[40px]" />

                      {/* GROUP 2 */}
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[28px]">YOUR CONTACT DETAILS</div>

                      <div className="grid md:grid-cols-2 gap-[20px]">
                        {/* Mobile */}
                        <div>
                          <label className={labelClass}>Mobile Number</label>
                          <div className="flex h-[46px] border border-[#E5E7EB] rounded-[8px] overflow-hidden focus-within:border-[#4CAF50] focus-within:ring-[3px] focus-within:ring-[rgba(76,175,80,0.12)] transition-all">
                            <CodeSelect value={countryCode} onChange={setCountryCode} />
                            <input
                              type="tel"
                              required
                              placeholder="98765 43210"
                              className="flex-1 bg-white border-0 px-[12px] text-[15px] outline-none placeholder:text-[#9CA3AF]"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className={labelClass}>Email Address <span className="text-[#9CA3AF] font-normal">(Optional)</span></label>
                          <input type="email" placeholder="you@example.com" className={inputClass} />
                        </div>
                      </div>

                      <div className="h-px bg-[#E5E7EB] my-[40px]" />

                      {/* GROUP 3 */}
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[28px]">
                        ANYTHING ELSE? <span className="font-normal">(OPTIONAL)</span>
                      </div>

                      <div>
                        <label className={labelClass}>Special Requirements or Questions</label>
                        <textarea
                          rows={4}
                          placeholder="Tell us more — type of item, urgency, packaging needs, or any customs questions."
                          className={`${inputClass} resize-y`}
                        />
                      </div>

                      <div className="mt-[36px]">
                        <button
                          type="submit"
                          disabled={formStatus === "loading"}
                          className="w-full bg-[#4CAF50] hover:bg-[#3D9940] disabled:opacity-80 text-white rounded-[8px] py-[16px] text-[16px] font-semibold tracking-[0.01em] transition-colors flex items-center justify-center gap-[8px]"
                        >
                          {formStatus === "loading" ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Calculating…
                            </>
                          ) : (
                            <>Get My Free Quote <ArrowRight className="w-[16px] h-[16px]" /></>
                          )}
                        </button>
                        <p className="text-[12px] text-[#9CA3AF] italic text-center mt-[12px]">
                          By submitting, you agree to be contacted by the Uniex team regarding your shipment enquiry.
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* RIGHT — SIDEBAR */}
              <div className="w-full lg:flex-1 flex flex-col gap-[24px] lg:sticky lg:top-[88px]">

                {/* BLOCK 1: Sample Rates */}
                <motion.div {...fadeUp(0.1)} className="border border-[#E5E7EB] rounded-[12px] p-[24px]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[20px]">SAMPLE RATES FROM INDIA</div>
                  {SAMPLE_RATES.map((r, i) => (
                    <div key={r.country}>
                      <div className="flex items-start justify-between py-[4px]">
                        <div>
                          <div className="text-[14px] font-semibold text-[#0D0D0D]">{r.flag} {r.country}</div>
                          <div className="text-[11px] text-[#9CA3AF] mt-[1px]">{r.days}</div>
                        </div>
                        <div className="text-[14px] font-medium text-[#374151] text-right">{r.rate}</div>
                      </div>
                      {i < SAMPLE_RATES.length - 1 && <div className="h-px bg-[#F3F4F6] my-[10px]" />}
                    </div>
                  ))}
                  <p className="text-[11px] italic text-[#9CA3AF] mt-[16px]">
                    *Rates vary by weight, service & customs. GST applicable. T&C apply.
                  </p>
                </motion.div>

                {/* BLOCK 2: Direct Contact */}
                <motion.div {...fadeUp(0.2)} className="bg-[#F1F8F1] border border-[#C8E6C9] rounded-[12px] p-[24px]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2E7D32] mb-[16px]">PREFER TO TALK?</div>

                  {[
                    { icon: Phone, line1: "+91 9600879666", line2: "Call or WhatsApp" },
                    { icon: Phone, line1: "+91 9380839266", line2: "Sales & Support" },
                    { icon: Mail, line1: "uniexanr@gmail.com", line2: "Email us anytime" },
                  ].map((row, i) => (
                    <div key={row.line1} className={`flex items-start gap-[12px] ${i > 0 ? "mt-[14px]" : ""}`}>
                      <row.icon className="w-[16px] h-[16px] text-[#4CAF50] shrink-0 mt-[2px]" />
                      <div>
                        <div className="text-[14px] font-semibold text-[#0D0D0D]">{row.line1}</div>
                        <div className="text-[12px] text-[#6B7280]">{row.line2}</div>
                      </div>
                    </div>
                  ))}

                  <a
                    href="https://wa.me/919600879666"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-[8px] border-[1.5px] border-[#4CAF50] text-[#4CAF50] hover:bg-[#F1F8F1] rounded-[8px] px-[16px] py-[10px] text-[14px] font-semibold transition-colors mt-[20px]"
                  >
                    <MessageCircle className="w-[16px] h-[16px]" />
                    Message Us on WhatsApp
                  </a>
                  <p className="text-[12px] text-[#9CA3AF] text-center mt-[14px]">Mon–Sat · 9 AM – 7 PM IST</p>
                </motion.div>

                {/* BLOCK 3: Why Uniex */}
                <motion.div {...fadeUp(0.3)} className="border border-[#E5E7EB] rounded-[12px] p-[24px]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[16px]">WHY CHOOSE UNIEX</div>
                  {[
                    "Pickup from anywhere in India",
                    "220+ countries delivered to",
                    "Free packing & document support",
                    "No hidden charges — ever",
                    "Real-time tracking on all shipments",
                  ].map((item, i) => (
                    <div key={item} className={`flex items-center gap-[10px] ${i > 0 ? "mt-[10px]" : ""}`}>
                      <div className="w-[20px] h-[20px] rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                        <Check className="w-[11px] h-[11px] text-[#4CAF50]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#374151]">{item}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — TRACK SHIPMENT */}
        <section className="bg-[#F1F8F1] py-[80px] max-md:py-[60px]">
          <div className="max-w-[800px] mx-auto px-[24px]">
            <motion.div {...fadeUp()} className="text-center mb-[48px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">ALREADY SHIPPED?</p>
              <h2 className="text-[30px] md:text-[36px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                Track your shipment<br />in real time.
              </h2>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="flex flex-col sm:flex-row items-start gap-[16px]">
              <div className="flex-1 w-full">
                <label className="block text-[13px] font-medium text-[#374151] mb-[8px]">Enter your tracking number(s)</label>
                <input
                  type="text"
                  placeholder="e.g. UNX2024001, UNX2024002"
                  className="w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[14px] text-[15px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.12)] transition-all"
                />
                <p className="text-[12px] text-[#9CA3AF] mt-[6px]">Separate multiple tracking numbers with a space or comma.</p>
              </div>
              <a
                href="/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[24px] py-[14px] text-[15px] font-semibold transition-colors mt-[24px] sm:mt-[0] sm:self-end"
              >
                Track Now <ArrowRight className="w-[15px] h-[15px]" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* SECTION 4 — CARRIERS STRIP */}
        <section className="bg-white border-t border-b border-[#E5E7EB] py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="text-center mb-10">
              <h3 className="text-[13px] font-bold text-[#4CAF50] uppercase tracking-[0.2em]">Certified Carriers</h3>
            </div>
            <motion.div {...fadeUp()} className="flex flex-wrap md:flex-nowrap items-center justify-center gap-12 md:gap-20">
              <img src="/logos/dpd.png" alt="DPD" className="h-[65px] md:h-[90px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/dhl.png" alt="DHL" className="h-[55px] md:h-[75px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/logoforbrand.png" alt="Uniex Courier Go" className="h-[75px] md:h-[105px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/dpex.png" alt="DPEX" className="h-[55px] md:h-[75px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/aramex.png" alt="Aramex" className="h-[50px] md:h-[70px] w-auto object-contain mix-blend-multiply" />
            </motion.div>
          </div>
        </section>

        {/* SECTION 5 — BOTTOM CTA */}
        <section className="bg-[#0D0D0D] py-[80px]">
          <div className="max-w-[800px] mx-auto px-[24px] text-center">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center justify-center bg-[#1A1A1A] border border-[#2E7D32] text-[#4CAF50] rounded-full px-[16px] py-[6px] text-[11px] font-bold uppercase tracking-[0.08em] mb-[24px]">
                NEED HELP DECIDING?
              </div>
              <h2 className="text-[36px] md:text-[44px] font-extrabold text-white leading-[1.15] tracking-[-0.02em] mb-[12px]">
                Not sure what to ship<br />or how to pack it?
              </h2>
              <p className="text-[14px] text-[#9CA3AF] max-w-[460px] mx-auto mt-[12px]">
                Call us and we'll guide you through everything — from rates and packaging to customs clearance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-[12px] mt-[36px]">
                <a href="tel:+919600879666" className="w-full sm:w-auto inline-flex items-center justify-center bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors">
                  Call +91 9600879666
                </a>
                <a href="https://wa.me/919600879666" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center border border-[#374151] hover:border-[#6B7280] hover:bg-[#1A1A1A] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors">
                  WhatsApp Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default GetQuote;
