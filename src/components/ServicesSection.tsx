import { motion } from "framer-motion";
import { FileText, GraduationCap, Luggage, Plane, ShoppingBag, Package, ArrowRight } from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Document Courier",
    desc: "Send legal papers, certificates, and important documents worldwide with guaranteed delivery timelines.",
  },
  {
    icon: GraduationCap,
    title: "University Express",
    desc: "Specialized courier for university applications and student documents to top destinations worldwide.",
  },
  {
    icon: Luggage,
    title: "Excess Baggage",
    desc: "Ship extra luggage internationally at a fraction of what airlines charge for excess baggage.",
  },
  {
    icon: Plane,
    title: "On-Board Courier",
    desc: "A dedicated courier personally carries your shipment on the next available flight. The fastest option possible.",
  },
  {
    icon: ShoppingBag,
    title: "Shop & Ship",
    desc: "We purchase from the USA, UK, Australia, Canada, and Europe and ship directly to your Indian address.",
  },
  {
    icon: Package,
    title: "Commercial Cargo",
    desc: "End-to-end international cargo solutions for businesses — including customs clearance and documentation.",
  },
];

const ServicesSection = () => (
  <section className="py-24 lg:py-28" id="services">
    <div className="container">
      {/* Header — left aligned */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
          WHAT WE OFFER
        </p>
        <h2 className="text-[32px] lg:text-[40px] font-bold text-brand-black leading-[1.2] tracking-[-0.02em] max-w-[480px]">
          Every kind of shipment.<br />Every corner of the world.
        </h2>
        <p className="text-base text-gray-500 mt-3 max-w-[420px]">
          From urgent documents to bulk cargo — Uniex handles it.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-xl p-7 group hover:border-green-primary transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-green-tint rounded-lg flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5 text-green-primary" />
            </div>
            <h3 className="text-base font-semibold text-brand-black mb-2">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{s.desc}</p>
            <a
              href="https://uniex.in/service"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-primary hover:underline group/link"
            >
              Learn more
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
