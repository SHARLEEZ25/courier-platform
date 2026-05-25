import { motion } from "framer-motion";

const CARRIERS = [
  { name: "DPD", src: "/logos/dpd.png", height: "h-[80px] md:h-[120px]" },
  { name: "DHL", src: "/logos/dhl.png", height: "h-[70px] md:h-[100px]" },
  { name: "DPEX", src: "/logos/dpex.png", height: "h-[70px] md:h-[105px]" },
  { name: "Aramex", src: "/logos/aramex.png", height: "h-[65px] md:h-[95px]" },
];

const PartnersSection = () => (
  <section className="bg-white py-24 md:py-36 border-b border-gray-100">
    <div className="container px-6">
      <div className="text-center mb-20 md:mb-28">
        <h2 className="text-[14px] font-extrabold text-[#4CAF50] uppercase tracking-[0.25em] mb-4">
          Trusted Carriers
        </h2>
        <p className="text-[36px] md:text-[48px] font-black text-[#0D0D0D] tracking-tight leading-tight">
          Global Logistics Partners
        </p>
      </div>
      
      {/* Desktop View: Static Row */}
      <div className="hidden md:flex md:flex-nowrap items-center justify-center gap-12 md:gap-20">
        {CARRIERS.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex items-center hover:scale-105 transition-transform duration-300 cursor-default"
          >
            <img 
              src={c.src} 
              alt={c.name} 
              className={`${c.height} w-auto object-contain mix-blend-multiply`}
            />
          </motion.div>
        ))}
      </div>

      {/* Mobile View: Continuous Marquee */}
      <div className="md:hidden overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap gap-12 w-max">
          {[...CARRIERS, ...CARRIERS].map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="flex items-center"
            >
              <img 
                src={c.src} 
                alt={c.name} 
                className={`${c.height} w-auto object-contain mix-blend-multiply max-h-[60px]`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PartnersSection;
