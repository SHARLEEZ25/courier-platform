import { motion } from "framer-motion";
import { FileText, GraduationCap, Luggage, Plane, ShoppingBag, Package, ArrowRight } from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Document Courier",
    desc: "Send legal documents, certificates, and important papers worldwide with guaranteed delivery timelines.",
  },
  {
    icon: GraduationCap,
    title: "University Express",
    desc: "Trusted courier for university applications, student documents, and academic submissions across the globe.",
  },
  {
    icon: Luggage,
    title: "Excess Baggage",
    desc: "Ship your extra luggage ahead at a fraction of airline excess baggage fees.",
  },
  {
    icon: Plane,
    title: "On-Board Courier (OBC)",
    desc: "The fastest option — a dedicated courier personally carries your shipment on the next available flight.",
  },
  {
    icon: ShoppingBag,
    title: "Shop & Ship",
    desc: "We shop from USA, UK, Australia, Canada & Europe and ship directly to your Indian address.",
  },
  {
    icon: Package,
    title: "Commercial Cargo",
    desc: "Full-service cargo solutions for businesses shipping goods internationally — customs handled end-to-end.",
  },
];

const ServicesSection = () => (
  <section className="py-20" id="services">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl lg:text-4xl font-semibold text-dark-text">Our Courier Services</h2>
        <p className="text-body-text mt-3 max-w-xl mx-auto">
          Everything from lightweight documents to heavy cargo — we handle it all
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-card-border rounded-xl p-6 hover:shadow-card-hover transition-all group border-l-4 border-l-primary"
          >
            <s.icon className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-display font-bold text-dark-text mb-2">{s.title}</h3>
            <p className="text-sm text-body-text leading-relaxed mb-4">{s.desc}</p>
            <a href="https://uniex.in/service" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Learn More <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
