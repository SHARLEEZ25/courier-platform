import { motion } from "framer-motion";
import { GraduationCap, UtensilsCrossed, Luggage, Ship, PackageOpen, Plane, FileText, Cpu } from "lucide-react";

const services = [
  {
    icon: GraduationCap,
    title: "Students Courier",
    desc: "Save more than 50% on student documents, university applications, and parcels worldwide.",
  },
  {
    icon: UtensilsCrossed,
    title: "Indian Food Items Shipping",
    desc: "Miss Indian food? We guarantee timely door-to-door delivery of your favourite food items.",
  },
  {
    icon: Luggage,
    title: "Excess Baggage Shipping",
    desc: "Save more than 50% on international excess baggage & unaccompanied baggage worldwide.",
  },
  {
    icon: Ship,
    title: "Export & Import",
    desc: "Bulk consignment solutions for businesses needing international export and import services.",
  },
  {
    icon: Plane,
    title: "On-Board Courier (OBC)",
    desc: "Premier on-board courier service for time-critical shipments across international borders.",
  },
  {
    icon: PackageOpen,
    title: "Shop & Ship",
    desc: "We buy products from across India and ship them directly to your doorstep abroad.",
  },
  {
    icon: FileText,
    title: "Document Delivery",
    desc: "Secure handling and delivery of sensitive legal, business, and government documents globally.",
  },
  {
    icon: Cpu,
    title: "Technology & Prototype",
    desc: "Bespoke courier service for sensitive technology, prototypes, and high-value innovations.",
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
        <span className="text-accent font-semibold text-sm tracking-wider uppercase">What We Offer</span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mt-2">Our Services</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Shop & Ship Medicines / Products from Chennai, India to the world.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <s.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display font-bold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
