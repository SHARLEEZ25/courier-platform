import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Package, Gem, FileText, Zap, Cpu, Film, Truck,
  ArrowRight, CheckCircle2, X, Check
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const StatCounter = ({ value, suffix }: { value: string; suffix: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Math.round(latest).toLocaleString() + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const numericValue = parseInt(value.replace(/,/g, ""));
      animate(count, numericValue, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
      });
    }
  }, [isInView, value, count]);

  return (
    <motion.div ref={ref} className="text-[40px] font-extrabold text-[#0D0D0D] leading-none tracking-[-0.03em]">
      {rounded}
    </motion.div>
  );
};

const anchors = [
  { label: "Students Courier", id: "students-courier" },
  { label: "Indian Food & Medicines", id: "indian-food-medicines" },
  { label: "Excess Baggage", id: "excess-baggage" },
  { label: "On-Board Courier (OBC)", id: "on-board-courier" },
  { label: "Export & Import", id: "export-import" },
  { label: "UK Delivery", id: "students-courier" }, // Points to relevant section
];

const obcCards = [
  { icon: GraduationCap, title: "International Students", copy: "Critical documents and personal items transported across continents, so students can focus on their studies without worrying about logistics." },
  { icon: Package, title: "Personal Items & Luggage", copy: "Whether relocating, traveling for business, or sending belongings to loved ones — your items arrive safely and on time, every time." },
  { icon: Gem, title: "Luxury & High-Value Items", copy: "Precious jewelry, fine art, exclusive fashion, and sensitive documents — transported with personal handling and constant supervision." },
  { icon: FileText, title: "Urgent Document Delivery", copy: "Legal documents, business contracts, financial records, and government papers delivered with maximum security and efficiency." },
  { icon: Zap, title: "Time-Critical Freight", copy: "Emergency parts and urgent freight for industries where downtime means financial loss. Speed and precision, guaranteed." },
  { icon: Cpu, title: "Technology & Prototypes", copy: "Sensitive tech components and prototypes handled with full confidentiality and integrity — from pickup to delivery." },
  { icon: Film, title: "Film & Media Equipment", copy: "Valuable production equipment delivered securely across continents — so your shoot goes on without interruption." },
  { icon: Truck, title: "Send Parcels to the UK", copy: "Fast, reliable, and affordable parcel delivery from Chennai to the UK. Powered by DPD, DHL, Uniex Courier Go, DPEX & UPS. Call +91 9380839266." },
];

const cities = [
  "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem",
  "Pondicherry", "Trivandrum", "Mumbai", "Delhi", "Hyderabad",
  "Bangalore", "Kolkata", "Goa", "Ahmedabad", "Pune", "Cochin",
  "Indore", "Jaipur", "Lucknow", "Visakhapatnam", "Vijayawada",
  "Kurnool", "Noida", "Calicut", "Kakinada", "Nellore",
];

const foodPills = [
  "Sweets & Snacks", "Pickles & Chutneys",
  "Sambar & Rasam Powder", "Indian Spices & Masalas",
  "Jaggery & Condiments", "Pooja Items",
  "Homemade Food Products", "Life-Saving Medicines",
  "Sarees & Garments", "Corporate Gifts",
  "Books & Study Materials", "Household Goods",
];

const Services = () => {
  const [activeSection, setActiveSection] = useState("students-courier");
  const pillRowRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    const sectionIds = [...new Set(anchors.map(a => a.id))];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#0D0D0D]">
      <TopBar />
      <Navbar />

      <main>

        {/* SECTION 1 — PAGE HERO */}
        <section className="bg-white pt-[72px] pb-[80px] max-md:pt-[48px] max-md:pb-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <div className="text-[12px] font-medium text-[#9CA3AF] mb-[12px]">
                Home <span className="mx-1">›</span><span className="text-[#374151]">Services</span>
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">WHAT WE OFFER</p>
              <h1 className="text-[40px] md:text-[52px] font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.03em] max-w-[600px]">
                Every shipment.<br />Every destination.<br />Handled.
              </h1>
              <p className="text-[17px] text-[#6B7280] leading-[1.75] max-w-[520px] mt-[20px]">
                From urgent documents and student parcels to bulk cargo and on-board couriers — Uniex handles it all, end-to-end, from India to 220+ countries worldwide.
              </p>

              {/* Anchor Pills */}
              <div
                ref={pillRowRef}
                className="flex items-center gap-[10px] mt-[36px] overflow-x-auto pb-[4px] scrollbar-hide"
                style={{ scrollbarWidth: "none" }}
              >
                {anchors.map((anchor) => (
                  <button
                    key={anchor.label}
                    onClick={() => scrollToSection(anchor.id)}
                    className={`shrink-0 rounded-full px-[18px] py-[8px] text-[13px] font-semibold border transition-all duration-300 ${
                      activeSection === anchor.id
                        ? "bg-[#4CAF50] text-white border-[#4CAF50] px-[22px]"
                        : "bg-[#F1F8F1] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#E8F5E9]"
                    }`}
                  >
                    {anchor.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 — STUDENTS COURIER */}
        <section id="students-courier" className="bg-white py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="flex flex-col md:flex-row items-center gap-[80px]">

              {/* LEFT */}
              <motion.div {...fadeUp()} className="w-full md:w-[52%] shrink-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">STUDENTS COURIER</p>
                <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                  Save over 50% on<br />student document courier.
                </h2>
                <p className="text-[16px] text-[#6B7280] leading-[1.75] mt-[20px]">
                  Uniex specializes in sending student documents, university applications, and personal parcels worldwide — at rates far below standard courier providers.
                </p>

                <div className="mt-[28px]">
                  <div className="text-[13px] font-semibold text-[#374151] mb-[12px]">We ship student documents to:</div>
                  <div className="grid grid-cols-2 gap-y-[8px] gap-x-[24px] max-w-[320px]">
                    {["UK", "USA", "Canada", "Australia", "Europe", "Singapore"].map(dest => (
                      <div key={dest} className="flex items-center gap-[8px] text-[14px] font-medium text-[#374151]">
                        <div className="w-[6px] h-[6px] rounded-full bg-[#4CAF50] shrink-0" />
                        {dest}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[12px] mt-[32px]">
                  <a href="/get-quote" className="inline-flex items-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors">
                    Get a Student Quote <ArrowRight className="w-[15px] h-[15px]" />
                  </a>
                  <a href="tel:+919600879666" className="inline-flex items-center gap-[8px] border border-[#4CAF50] text-[#4CAF50] hover:bg-[#F1F8F1] rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors">
                    Call Us Now
                  </a>
                </div>
              </motion.div>

              {/* RIGHT — Stats */}
              <motion.div {...fadeUp(0.1)} className="w-full md:flex-1">
                {[
                  { num: "50", suffix: "%+", label: "Savings vs standard courier rates" },
                  { num: "220", suffix: "+", label: "Countries we deliver student documents to" },
                  { num: "5", suffix: " Days max", label: "Business days to UK, USA & Canada" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    {...fadeUp(i * 0.08)}
                    className={`py-[24px] ${i < 2 ? "border-b border-[#E5E7EB]" : ""}`}
                  >
                    <StatCounter value={stat.num} suffix={stat.suffix} />
                    <div className="text-[13px] font-medium text-[#6B7280] mt-[4px]">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — INDIAN FOOD & MEDICINES */}
        <section id="indian-food-medicines" className="bg-[#F1F8F1] py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="flex flex-col md:flex-row items-center gap-[80px]">

              {/* LEFT — Item grid */}
              <motion.div {...fadeUp()} className="w-full md:w-[44%] shrink-0 order-2 md:order-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[20px]">WHAT WE SHIP</div>
                <div className="grid grid-cols-2 gap-[10px]">
                  {foodPills.map((pill, i) => (
                    <motion.div
                      key={pill}
                      {...fadeUp(i * 0.04)}
                      className="bg-white border border-[#E5E7EB] rounded-[8px] px-[14px] py-[10px] text-[13px] font-medium text-[#374151] hover:border-[#4CAF50] transition-colors cursor-default"
                    >
                      {pill}
                    </motion.div>
                  ))}
                </div>
                <p className="text-[12px] italic text-[#9CA3AF] mt-[16px]">
                  *Subject to customs clearance. GST applicable. Medicine courier requires prescription, bill & sender Aadhaar.
                </p>
              </motion.div>

              {/* RIGHT — Content */}
              <motion.div {...fadeUp(0.1)} className="w-full md:flex-1 order-1 md:order-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">INDIAN FOOD & MEDICINES</p>
                <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                  Missing home?<br />We'll get it there.
                </h2>
                <p className="text-[16px] text-[#6B7280] leading-[1.75] mt-[20px]">
                  Do you miss Indian food abroad? Uniex guarantees your goods arrive at your doorstep on time — safely packed and cleared through customs. We ship Indian food items, spices, homemade eatables, and life-saving medicines from India to the USA, UK, Singapore, Malaysia, and more.
                </p>

                <div className="mt-[24px]">
                  <div className="text-[13px] font-semibold text-[#374151] mb-[10px]">Serving customers in:</div>
                  <div className="text-[14px] font-medium text-[#4CAF50]">
                    USA <span className="text-[#D1D5DB]">·</span> UK <span className="text-[#D1D5DB]">·</span> Singapore <span className="text-[#D1D5DB]">·</span> Malaysia <span className="text-[#D1D5DB]">·</span> Australia <span className="text-[#D1D5DB]">·</span> Canada <span className="text-[#D1D5DB]">·</span> UAE <span className="text-[#D1D5DB]">·</span> Europe
                  </div>
                </div>

                {/* Medicine note */}
                <div className="bg-white border-l-[4px] border-[#4CAF50] rounded-[0_8px_8px_0] px-[20px] py-[16px] mt-[32px]">
                  <div className="text-[14px] font-bold text-[#0D0D0D] mb-[8px]">Medicine Courier — What You Need</div>
                  <ul className="text-[13px] text-[#6B7280] leading-[1.8] space-y-[4px]">
                    <li>· Valid medicine prescription</li>
                    <li>· Original medicine bill</li>
                    <li>· Sender Aadhaar card copy</li>
                  </ul>
                </div>

                <a href="/get-quote" className="inline-flex items-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors mt-[28px]">
                  Book a Food Shipment <ArrowRight className="w-[15px] h-[15px]" />
                </a>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SECTION 4 — EXCESS BAGGAGE */}
        <section id="excess-baggage" className="bg-white py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div {...fadeUp()}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">EXCESS BAGGAGE</p>
              <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                Why pay airline surcharges?<br />Ship it with us instead.
              </h2>
              <p className="text-[16px] text-[#6B7280] leading-[1.75] max-w-[540px] mt-[16px]">
                Save more than 50% on international excess baggage and unaccompanied baggage. We pick up from your door and deliver to your destination — worldwide.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-[32px] mt-[56px] items-start">
              {/* Airline Way */}
              <motion.div 
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-[15px] font-bold text-[#0D0D0D] mb-[12px]">The Airline Way</div>
                <ul className="space-y-[4px]">
                  {[
                    "₹3,000–₹8,000 per extra kg on most airlines",
                    "Strict weight and size limits",
                    "Risk of damage in hold",
                    "No tracking or updates",
                  ].map((item, idx) => (
                    <motion.li 
                      key={item} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + idx * 0.08, duration: 0.3 }}
                      className="flex items-start gap-[8px] text-[13px] text-[#6B7280] leading-[2]"
                    >
                      <X className="w-[14px] h-[14px] text-[#EF4444] shrink-0 mt-[4px]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Vertical divider */}
              <div className="hidden md:block w-px bg-[#E5E7EB] self-stretch" />

              {/* Uniex Way */}
              <motion.div 
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-[15px] font-bold text-[#0D0D0D] mb-[12px]">The Uniex Way</div>
                <ul className="space-y-[4px]">
                  {[
                    "Save 50%+ compared to airline excess rates",
                    "Ship any size or weight — no airline restrictions",
                    "Secure packing and door-to-door delivery",
                    "Real-time tracking from pickup to delivery",
                  ].map((item, idx) => (
                    <motion.li 
                      key={item} 
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + idx * 0.08, duration: 0.3 }}
                      className="flex items-start gap-[8px] text-[13px] text-[#374151] leading-[2]"
                    >
                      <Check className="w-[14px] h-[14px] text-[#4CAF50] shrink-0 mt-[4px]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <div className="flex flex-wrap items-center gap-[12px] mt-[48px]">
              <a href="/get-quote" className="inline-flex items-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors">
                Get an Excess Baggage Quote <ArrowRight className="w-[15px] h-[15px]" />
              </a>
              <a href="tel:+919600879666" className="inline-flex items-center gap-[8px] border border-[#4CAF50] text-[#4CAF50] hover:bg-[#F1F8F1] rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors">
                Call +91 9600879666
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 5 — ON-BOARD COURIER (OBC) */}
        <section id="on-board-courier" className="bg-[#F1F8F1] py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div {...fadeUp()}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">ON-BOARD COURIER (OBC)</p>
              <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                The fastest shipment<br />option in the world.
              </h2>
              <p className="text-[16px] text-[#6B7280] leading-[1.75] max-w-[520px] mt-[16px]">
                In today's interconnected global marketplace, ensuring the swift and secure delivery of time-critical shipments is paramount. Uniex's On-Board Courier service assigns a dedicated courier who personally carries your shipment on the next available flight — no warehouses, no delays.
              </p>
              <div className="flex flex-wrap items-center gap-[20px] mt-[28px]">
                <a href="/get-quote" className="inline-flex items-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors">
                  Request an OBC Quote <ArrowRight className="w-[15px] h-[15px]" />
                </a>
                <a href="tel:+919380839266" className="text-[14px] font-semibold text-[#4CAF50] hover:text-[#3D9940] transition-colors flex items-center gap-[4px]">
                  Call +91 9380839266 →
                </a>
              </div>
            </motion.div>

            {/* OBC Use Case Cards */}
            <div className="mt-[72px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[24px]">WHO USES OBC?</div>

              {/* First 6 cards in 3-col grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                {obcCards.slice(0, 6).map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="bg-[#F1F8F1] border border-[#E5E7EB] hover:border-[#4CAF50] rounded-[12px] p-[28px] transition-colors"
                  >
                    <div className="w-[40px] h-[40px] rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center mb-[16px]">
                      <card.icon className="w-[20px] h-[20px] text-[#4CAF50]" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#0D0D0D] mb-[8px]">{card.title}</h3>
                    <p className="text-[14px] text-[#6B7280] leading-[1.6]">{card.copy}</p>
                  </motion.div>
                ))}
              </div>

              {/* Last 2 cards centered */}
              <div className="flex justify-center gap-[24px] mt-[24px] flex-col sm:flex-row">
                {obcCards.slice(6).map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (6 + i) * 0.06, duration: 0.4 }}
                    className="bg-[#F1F8F1] border border-[#E5E7EB] hover:border-[#4CAF50] rounded-[12px] p-[28px] transition-colors w-full sm:w-[calc(33.333%-12px)]"
                  >
                    <div className="w-[40px] h-[40px] rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center mb-[16px]">
                      <card.icon className="w-[20px] h-[20px] text-[#4CAF50]" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#0D0D0D] mb-[8px]">{card.title}</h3>
                    <p className="text-[14px] text-[#6B7280] leading-[1.6]">{card.copy}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — EXPORT & IMPORT */}
        <section id="export-import" className="bg-white py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-[48px] items-start">

              {/* EXPORT */}
              <motion.div {...fadeUp()}>
                <div className="inline-flex items-center bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] rounded-full px-[12px] py-[4px] text-[12px] font-semibold uppercase">
                  EXPORT
                </div>
                <h3 className="text-[28px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em] mt-[16px]">
                  Bulk Consignment Export
                </h3>
                <p className="text-[15px] text-[#6B7280] leading-[1.75] mt-[16px]">
                  We handle bulk consignment exports from India to international destinations — with full customs documentation, competitive freight rates, and end-to-end tracking.
                </p>
                <ul className="mt-[24px] space-y-[12px]">
                  {[
                    "Full export documentation support",
                    "Customs clearance handled end-to-end",
                    "Bulk and commercial shipment rates",
                    "Pickup from all major Indian cities",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-[10px] text-[14px] font-medium text-[#374151]">
                      <CheckCircle2 className="w-[16px] h-[16px] text-[#4CAF50] shrink-0 mt-[2px]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/get-quote" className="inline-flex items-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors mt-[28px]">
                  Enquire About Export <ArrowRight className="w-[15px] h-[15px]" />
                </a>
              </motion.div>

              {/* Vertical divider */}
              <div className="hidden md:block w-px bg-[#E5E7EB] self-stretch" />

              {/* IMPORT */}
              <motion.div {...fadeUp(0.12)}>
                <div className="inline-flex items-center bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] rounded-full px-[12px] py-[4px] text-[12px] font-semibold uppercase">
                  IMPORT
                </div>
                <h3 className="text-[28px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em] mt-[16px]">
                  Bulk Consignment Import
                </h3>
                <p className="text-[15px] text-[#6B7280] leading-[1.75] mt-[16px]">
                  Receiving goods in India from abroad? We manage international import shipments with customs clearance, last-mile delivery, and full documentation support.
                </p>
                <ul className="mt-[24px] space-y-[12px]">
                  {[
                    "Import customs clearance support",
                    "Last-mile delivery across India",
                    "Competitive import freight rates",
                    "Dedicated import handling team",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-[10px] text-[14px] font-medium text-[#374151]">
                      <CheckCircle2 className="w-[16px] h-[16px] text-[#4CAF50] shrink-0 mt-[2px]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="/get-quote" className="inline-flex items-center gap-[8px] border border-[#4CAF50] text-[#4CAF50] hover:bg-[#F1F8F1] rounded-[8px] px-[20px] py-[11px] text-[14px] font-semibold transition-colors mt-[28px]">
                  Enquire About Import <ArrowRight className="w-[15px] h-[15px]" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — CARRIER STRIP */}
        <section className="bg-[#F9FAFB] border-t border-b border-[#E5E7EB] py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="text-center mb-10">
              <h3 className="text-[13px] font-bold text-[#4CAF50] uppercase tracking-[0.2em]">Our Logistics Network</h3>
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-12 md:gap-20">
              <img src="/logos/dpd.png" alt="DPD" className="h-[65px] md:h-[90px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/dhl.png" alt="DHL" className="h-[55px] md:h-[75px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/logoforbrand.png" alt="Uniex Courier Go" className="h-[75px] md:h-[105px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/dpex.png" alt="DPEX" className="h-[55px] md:h-[75px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/aramex.png" alt="Aramex" className="h-[50px] md:h-[70px] w-auto object-contain mix-blend-multiply" />
            </div>
          </div>
        </section>

        {/* SECTION 8 — COVERAGE STRIP */}
        <section className="bg-white py-[80px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div {...fadeUp()} className="text-center mb-[40px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">PICKUP NETWORK</p>
              <h2 className="text-[32px] md:text-[36px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                We come to you —<br />anywhere in India.
              </h2>
              <p className="text-[16px] text-[#6B7280] mt-[16px]">
                Door pickup available from Chennai, Tamil Nadu, and all major Indian cities.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-[10px]">
              {cities.map((city, i) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: i * 0.025, 
                    duration: 0.3, 
                    ease: "easeOut" 
                  }}
                  className="bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#4CAF50] hover:text-[#4CAF50] rounded-full px-[16px] py-[6px] text-[13px] font-medium text-[#374151] transition-colors cursor-default"
                >
                  {city}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9 — BOTTOM CTA BANNER */}
        <section className="bg-[#0D0D0D] py-[80px]">
          <div className="max-w-[800px] mx-auto px-[24px] text-center">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center justify-center bg-[#1A1A1A] border border-[#2E7D32] text-[#4CAF50] rounded-full px-[16px] py-[6px] text-[11px] font-bold uppercase tracking-[0.08em] mb-[24px]">
                READY TO SHIP?
              </div>
              <h2 className="text-[36px] md:text-[44px] font-extrabold text-white leading-[1.15] tracking-[-0.02em] mb-[12px]">
                Not sure which service<br />you need? Just call us.
              </h2>
              <p className="text-[14px] text-[#9CA3AF] max-w-[480px] mx-auto mt-[12px]">
                Our team will guide you to the right service, the right carrier, and the right rate — in minutes.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-[12px] mt-[36px]">
                <a href="/get-quote" className="w-full sm:w-auto inline-flex items-center justify-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors">
                  Get a Free Quote <ArrowRight className="w-[16px] h-[16px]" />
                </a>
                <a href="tel:+919600879666" className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-[#374151] hover:border-[#6B7280] hover:bg-[#1A1A1A] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors">
                  Call +91 9600879666
                </a>
                <a href="https://wa.me/919600879666" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-[#374151] hover:border-[#6B7280] hover:bg-[#1A1A1A] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors">
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

export default Services;
