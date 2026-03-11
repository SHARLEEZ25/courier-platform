import { motion } from "framer-motion";
import { FileText, GraduationCap, Luggage, Plane, ShoppingBag, Package, ArrowRight } from "lucide-react";

const services = [
  {
    icon: GraduationCap,
    title: "Students & University Courier",
    desc: "Save more than 50% on student documents, university applications, and parcels worldwide. Specialized courier to UK, USA, Canada, Australia, Europe, and Singapore.",
  },
  {
    icon: ShoppingBag,
    title: "Shop & Ship",
    desc: "We shop and ship medicines or products from the USA, UK, Europe, Australia, and Canada directly to your door. We arrange pickup too.",
  },
  {
    icon: Package,
    title: "Indian Food & Medicines",
    desc: "Send sweets, snacks, spices, homemade food items, and life-saving medicines from India to family abroad — safely and reliably.",
  },
  {
    icon: Luggage,
    title: "Excess Baggage",
    desc: "Save more than 50% on international excess baggage. Ship your unaccompanied baggage worldwide instead of paying airline surcharges.",
  },
  {
    icon: Plane,
    title: "On-Board Courier (OBC)",
    desc: "For time-critical shipments — a dedicated courier personally carries your package on the next available flight. Ideal for urgent freight, prototypes, and high-value items.",
  },
  {
    icon: FileText,
    title: "Commercial Cargo & Export",
    desc: "Bulk consignment shipping for businesses. We handle commercial parcels, export cargo, and import shipments with full customs clearance support.",
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
          From urgent documents to bulk cargo — we handle pickup,
          customs, and door-to-door delivery.
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
            <div className="w-10 h-10 bg-green-tint rounded-lg flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-[1.08]">
              <s.icon className="w-5 h-5 text-green-primary" />
            </div>
            <h3 className="text-base font-semibold text-brand-black mb-2">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{s.desc}</p>
            <div
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-primary group/link cursor-pointer hover:underline"
            >
              Learn more
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-[4px]" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
