import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import {
  BadgeCheck, Globe, MapPin, Shield, Truck, Headphones,
  User, GraduationCap, Briefcase, Package2, ArrowRight
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

const StatCounter = ({ value, suffix, isSmall = false }: { value: string; suffix: string; isSmall?: boolean }) => {
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
    <motion.div 
      ref={ref} 
      className="font-extrabold text-[#0D0D0D] leading-none tracking-[-0.03em]"
      style={{ fontSize: isSmall ? "28px" : "44px" }}
    >
      {rounded}
    </motion.div>
  );
};

const About = () => {
  const whyCards = [
    {
      icon: Globe,
      title: "Global Reach",
      copy: "Direct courier delivery from India to top destinations like New York, London, Toronto, Sydney, Dubai, Frankfurt, and beyond — 220+ countries covered.",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      copy: "Stay informed with our advanced online tracking system. Know exactly where your shipment is at every stage.",
    },
    {
      icon: Shield,
      title: "Fast & Secure Shipping",
      copy: "Timely and safe international parcel delivery through our robust logistics network — powered by DPD, DHL, Uniex Courier Go, DPEX, and UPS.",
    },
    {
      icon: Headphones,
      title: "Affordable Rates",
      copy: "Competitive international courier pricing without compromising on quality, speed, or reliability. No hidden charges.",
    },
    {
      icon: Truck,
      title: "Door Pickup & Packing",
      copy: "We come to you. Door pickup available across Chennai, Tamil Nadu, and all major cities in India. Free box packing included.",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      copy: "A professional and friendly team providing personalized service. Reach us via phone, WhatsApp, or email — any time you need us.",
    },
  ];

  const regions = [
    { label: "AMERICAS", countries: "United States · Canada" },
    { label: "EUROPE", countries: "United Kingdom · Germany · France" },
    { label: "ASIA PACIFIC", countries: "Australia · Singapore · Malaysia · China · Hong Kong · Sri Lanka" },
    { label: "MIDDLE EAST & AFRICA", countries: "Dubai · South Africa · Middle East (Regional)" },
  ];

  const countryPills = [
    "United States", "United Kingdom", "Australia", "Germany",
    "France", "Canada", "Dubai", "Singapore", "Malaysia",
    "Sri Lanka", "South Africa", "China", "Hong Kong", "Middle East",
  ];

  const missionPillars = [
    { title: "Customer Satisfaction", detail: "Every shipment handled with care and accountability." },
    { title: "Speed of Delivery", detail: "Express and economy options to match every timeline." },
    { title: "Cost-Efficiency", detail: "Competitive rates with no hidden charges, ever." },
    { title: "Global Reliability", detail: "18 years of consistent, on-time international delivery." },
  ];

  const serveColumns = [
    { icon: User, title: "Individuals", copy: "Sending gifts, clothes, food, or personal parcels to family and friends abroad." },
    { icon: GraduationCap, title: "Students", copy: "University applications, documents, and personal items sent to institutions worldwide." },
    { icon: Briefcase, title: "SMEs & Businesses", copy: "Commercial cargo, business documents, and product shipments with customs support." },
    { icon: Package2, title: "Exporters", copy: "Bulk consignment and export cargo handled end-to-end from any major city in India." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#0D0D0D]">
      <TopBar />
      <Navbar />

      <main>

        {/* SECTION 1 — PAGE HERO */}
        <section className="bg-white pt-[80px] pb-[100px] max-md:pt-[60px] max-md:pb-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            {/* Breadcrumb */}
            <div className="text-[12px] font-medium text-[#9CA3AF] mb-[40px]">
              Home <span className="mx-1">›</span><span className="text-[#374151]">About Us</span>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-[80px]">

              {/* LEFT */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-[58%] shrink-0"
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">OUR STORY</p>
                <h1 className="text-[40px] md:text-[52px] font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.03em] max-w-[560px]">
                  18 years of getting<br />it there — reliably.
                </h1>
                <p className="text-[17px] font-normal text-[#6B7280] leading-[1.75] max-w-[480px] mt-[20px]">
                  Uniex International Courier Services is a trusted name in global logistics — headquartered in Chennai, India, delivering to 220+ countries for over 18 years.
                </p>

                {/* Certification badges */}
                <div className="flex flex-wrap items-center gap-[12px] mt-[32px]">
                  <div className="inline-flex items-center gap-[8px] bg-[#F1F8F1] border border-[#C8E6C9] rounded-full px-[14px] py-[6px]">
                    <BadgeCheck className="w-[16px] h-[16px] text-[#4CAF50]" />
                    <span className="text-[13px] font-semibold text-[#2E7D32]">ISO 9001:2015 Certified</span>
                  </div>
                  <div className="inline-flex items-center gap-[8px] bg-[#F1F8F1] border border-[#C8E6C9] rounded-full px-[14px] py-[6px]">
                    <Globe className="w-[16px] h-[16px] text-[#4CAF50]" />
                    <span className="text-[13px] font-semibold text-[#2E7D32]">220+ Countries Served</span>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT — Stats Crosshair Grid */}
              <div className="w-full lg:flex-1">
                <div className="relative grid grid-cols-2">
                  {/* Crosshair lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Horizontal */}
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
                      className="absolute top-1/2 left-0 right-0 h-px bg-[#E5E7EB] origin-center" 
                    />
                    {/* Vertical */}
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
                      className="absolute left-1/2 top-0 bottom-0 w-px bg-[#E5E7EB] origin-center" 
                    />
                  </div>

                  {[
                    { num: "18", suffix: "+", label: "Years in Business" },
                    { num: "220", suffix: "+", label: "Countries Served" },
                    { num: "100000", suffix: "+", label: "Customers Served" },
                    { num: "4", suffix: "", label: "Global Carrier Partners" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      className={`flex flex-col overflow-hidden min-h-[140px] p-[24px] ${i < 2 ? "pb-[36px]" : "pt-[36px]"} ${i % 2 === 0 ? "pr-[24px]" : "pl-[24px]"}`}
                    >
                      <StatCounter value={stat.num} suffix={stat.suffix} isSmall={stat.num === "100000"} />
                      <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.06em] mt-[8px]">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — WHO WE ARE */}
        <section className="bg-[#F1F8F1] py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="flex flex-col md:flex-row items-center gap-[80px]">

              {/* LEFT — Pull quote */}
              <motion.div {...fadeUp()} className="w-full md:w-[52%] shrink-0">
                <div className="text-[120px] font-extrabold text-[#E8F5E9] leading-[0.8] block mb-[-20px] select-none">"</div>
                <div className="text-[28px] font-bold text-[#0D0D0D] leading-[1.4] tracking-[-0.02em]">
                  {"We don't just deliver parcels — we deliver promises.".split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="inline-block mr-[0.25em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
                <p className="text-[14px] font-medium text-[#9CA3AF] italic mt-[16px]">
                  — Uniex Courier, Chennai · Since 2006
                </p>
                <div className="w-[60px] h-px bg-[#E5E7EB] mt-[28px]" />
                <p className="text-[15px] text-[#6B7280] leading-[1.7] max-w-[420px] mt-[20px]">
                  Our tagline "Ithu Namma Courier" means "This is Our Courier" — a reflection of the trust we've built with every customer across India and the world.
                </p>
              </motion.div>

              {/* RIGHT — Company description */}
              <motion.div {...fadeUp(0.12)} className="w-full md:flex-1">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">ABOUT UNIEX</p>
                <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                  Your global courier<br />partner from India.
                </h2>
                <p className="text-[16px] text-[#6B7280] leading-[1.75] mt-[20px]">
                  Uniex International Courier Services — widely known as Uniex — is headquartered in Chennai, India, and specializes in international courier and cargo delivery across 220+ countries including the USA, UK, Canada, Australia, Europe, Dubai, Singapore, and Malaysia.
                </p>
                <p className="text-[16px] text-[#6B7280] leading-[1.75] mt-[16px]">
                  We are an ISO 9001:2015 certified courier company recognized for our commitment to reliability, affordability, and speed. As the official courier partner of major global events including the USA Global Tamil Conference and UKAT, Uniex continues to set the benchmark in international parcel delivery.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — WHY CHOOSE UNIEX */}
        <section className="bg-white py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div {...fadeUp()}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">WHY CHOOSE US</p>
              <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                Built different.<br />Proven over 18 years.
              </h2>
              <p className="text-[16px] text-[#6B7280] max-w-[420px] mt-[16px]">
                Every feature we offer exists because a customer needed it.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[24px] mt-[56px]">
              {whyCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  {...fadeUp(i * 0.08)}
                  className="border border-[#E5E7EB] hover:border-[#4CAF50] rounded-[12px] p-[28px] transition-colors duration-200"
                >
                  <div className="w-[40px] h-[40px] rounded-[8px] bg-[#F1F8F1] flex items-center justify-center mb-[16px]">
                    <card.icon className="w-[20px] h-[20px] text-[#4CAF50]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#0D0D0D] mb-[8px]">{card.title}</h3>
                  <p className="text-[14px] text-[#6B7280] leading-[1.6]">{card.copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — GLOBAL PRESENCE */}
        <section className="bg-[#F1F8F1] py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div {...fadeUp()} className="text-center mb-[56px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">OUR GLOBAL FOOTPRINT</p>
              <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                Offices and operations<br />across 4 continents.
              </h2>
              <p className="text-[16px] text-[#6B7280] max-w-[480px] mx-auto mt-[16px]">
                Our international presence enables faster delivery timelines and cost-effective solutions for customers worldwide.
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row items-start gap-[80px]">

              {/* LEFT — Regions */}
              <motion.div {...fadeUp(0.1)} className="w-full md:w-[45%] shrink-0">
                <p className="text-[15px] text-[#6B7280] leading-[1.75] mb-[36px]">
                  Uniex has established operational offices in key international markets — enabling us to offer local expertise, faster customs clearance, and end-to-end delivery support in each region.
                </p>

                {regions.map((region, i) => (
                  <div key={region.label}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[10px]">
                      {region.label}
                    </div>
                    <div className="text-[14px] font-medium text-[#374151] leading-[2]">
                      {region.countries}
                    </div>
                    {i < regions.length - 1 && (
                      <div className="h-px bg-[#E5E7EB] my-[20px]" />
                    )}
                  </div>
                ))}
              </motion.div>

              {/* RIGHT — Country pills */}
              <motion.div {...fadeUp(0.2)} className="w-full md:flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[20px]">
                  ALL LOCATIONS
                </div>
                <div className="flex flex-wrap gap-[10px]">
                  {countryPills.map((country, i) => (
                    <motion.div
                      key={country}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: i * 0.02, 
                        duration: 0.3, 
                        ease: "easeOut" 
                      }}
                      className="bg-white border border-[#E5E7EB] rounded-full px-[16px] py-[8px] text-[13px] font-medium text-[#374151] hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors duration-200 cursor-default"
                    >
                      {country}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — VISION & MISSION */}
        <section className="bg-white py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="flex flex-col md:flex-row items-start gap-[80px]">

              {/* LEFT — Mission */}
              <motion.div {...fadeUp()} className="w-full md:w-[50%] shrink-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">OUR MISSION</p>
                <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                  Simple mission.<br />Uncompromised execution.
                </h2>
                <p className="text-[16px] text-[#6B7280] leading-[1.75] mt-[20px]">
                  Our mission is to provide the best international courier service from India — with a focus on customer satisfaction, speed of delivery, cost-efficiency, and global reliability.
                </p>

                <div className="mt-[32px] space-y-[20px]">
                  {missionPillars.map((pillar, i) => (
                    <motion.div
                      key={pillar.title}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="relative pl-[16px]"
                    >
                      <motion.div 
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.2, duration: 0.4, ease: "easeOut" }}
                        className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#4CAF50] origin-top"
                      />
                      <div className="text-[15px] font-semibold text-[#0D0D0D]">{pillar.title}</div>
                      <div className="text-[13px] text-[#6B7280] mt-[4px]">{pillar.detail}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* RIGHT — Vision */}
              <motion.div {...fadeUp(0.12)} className="w-full md:flex-1">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">OUR VISION</p>
                <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                  Connecting India<br />to the world.
                </h2>
                <p className="text-[16px] text-[#6B7280] leading-[1.75] mt-[20px]">
                  We envision a world where every person in India — whether sending a parcel to a student in London, gifts to family in Toronto, or business cargo to Dubai — can do so with the same confidence as a local delivery.
                </p>

                {/* Trust block */}
                <div className="bg-[#F1F8F1] border-l-[4px] border-[#4CAF50] rounded-[0_8px_8px_0] px-[24px] py-[20px] mt-[36px]">
                  <div className="text-[16px] font-bold text-[#0D0D0D]">Trusted by 1,00,000+ Customers</div>
                  <p className="text-[14px] text-[#6B7280] leading-[1.7] mt-[6px]">
                    Across India and worldwide — individuals, students, SMEs, exporters, and enterprises trust Uniex for dependable international courier delivery.
                  </p>
                  <p className="text-[13px] font-semibold text-[#4CAF50] italic mt-[16px]">
                    "Ithu Namma Courier" — This is Our Courier.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — CARRIER PARTNERS */}
        <section className="bg-[#F1F8F1] py-[100px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <div className="text-center mb-12">
              <h3 className="text-[13px] font-bold text-[#4CAF50] uppercase tracking-[0.2em]">Our Shipping Partners</h3>
            </div>
            <motion.div {...fadeUp()} className="flex flex-wrap md:flex-nowrap items-center justify-center gap-12 md:gap-20">
              <img src="/logos/dpd.png" alt="DPD" className="h-[40px] md:h-[55px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/dhl.png" alt="DHL" className="h-[35px] md:h-[45px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/logoforbrand.png" alt="Uniex Courier Go" className="h-[50px] md:h-[65px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/dpex.png" alt="DPEX" className="h-[35px] md:h-[45px] w-auto object-contain mix-blend-multiply" />
              <img src="/logos/aramex.png" alt="Aramex" className="h-[30px] md:h-[40px] w-auto object-contain mix-blend-multiply" />
            </motion.div>
          </div>
        </section>

        {/* SECTION 7 — WHO WE SERVE */}
        <section className="bg-white py-[100px] max-md:py-[60px]">
          <div className="max-w-[1248px] mx-auto px-[24px]">
            <motion.div {...fadeUp()}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">WHO WE SERVE</p>
              <h2 className="text-[32px] md:text-[38px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">
                For individuals, students,<br />businesses, and exporters.
              </h2>
              <p className="text-[16px] text-[#6B7280] max-w-[480px] mt-[16px]">
                Whether you're sending documents to the USA, gifts to the UK, or business shipments to Canada — Uniex is built for you.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mt-[56px]">
              {serveColumns.map((col, i) => (
                <motion.div 
                  key={col.title} 
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    whileInView={{ scale: 1, opacity: 0.1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.6, type: "spring", stiffness: 100 }}
                    className="text-[48px] font-extrabold text-[#4CAF50] leading-none select-none"
                  >
                    0{i + 1}
                  </motion.div>
                  <div className="w-[24px] h-[24px] -mt-[28px] relative z-10">
                    <col.icon className="w-[24px] h-[24px] text-[#4CAF50]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#0D0D0D] mt-[12px] mb-[8px]">{col.title}</h3>
                  <p className="text-[14px] text-[#6B7280] leading-[1.6]">{col.copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8 — BOTTOM CTA BANNER */}
        <section className="bg-[#0D0D0D] py-[80px]">
          <div className="max-w-[800px] mx-auto px-[24px] text-center">
            <motion.div {...fadeUp()}>
              <div className="inline-flex items-center justify-center bg-[#1A1A1A] border border-[#2E7D32] text-[#4CAF50] rounded-full px-[16px] py-[6px] text-[11px] font-bold uppercase tracking-[0.08em] mb-[24px]">
                YOUR GLOBAL COURIER PARTNER
              </div>
              <h2 className="text-[36px] md:text-[44px] font-extrabold text-white leading-[1.15] tracking-[-0.02em] mb-[12px]">
                Fast. Affordable. Reliable.<br />From India to the world.
              </h2>
              <p className="text-[14px] text-[#9CA3AF] max-w-[480px] mx-auto mt-[12px]">
                For over 18 years, Uniex has been the trusted choice for international courier from India. Join 1,00,000+ customers who ship with us.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-[12px] mt-[36px]">
                <a
                  href="/get-quote"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-[8px] bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors"
                >
                  Get a Free Quote <ArrowRight className="w-[16px] h-[16px]" />
                </a>
                <a
                  href="tel:+919600879666"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-[#374151] hover:border-[#6B7280] hover:bg-[#1A1A1A] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors"
                >
                  Call +91 9600879666
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

export default About;
