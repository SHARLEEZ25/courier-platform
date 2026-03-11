import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";

const branches = [
  { city: "Chennai (HQ)", address: "First Floor, Old No.4V, New No.7, Gayatri Villa, Josier Street, Nungambakkam, Chennai - 600034", phone: "+919380839266" },
  { city: "Bangalore", address: "No.15, 1st Cross Rd, Wilson Garden, Bengaluru, Karnataka 560027", phone: "+919600879666" },
  { city: "Madurai", address: "39/8, Workshop Road, Simmakkal, Madurai - 625001", phone: "+919600879666" },
  { city: "Mumbai", address: "Shop No.1, Radkhu Housing Society, Military Road, Marol Andheri East, Mumbai - 400059", phone: "+919600879666" },
  { city: "Delhi", address: "A-128, Road No-1, Block A, Mahipal, New Delhi - 110037", phone: "+919600879666" },
  { city: "Coimbatore", address: "No.142 Trichy Road, Ondipudur, Coimbatore - 641016", phone: "+919600879666" },
  { city: "Hyderabad", address: "FMA Residency, H.NO 1-10-27/16, Prakesh Nagar, Begumpet, Secunderabad - 500016", phone: "+919600879666" },
  { city: "Villupuram", address: "10 Bus Stand Road, Villupuram - 605602", phone: "+919380839266" },
];

const BranchesSection = () => (
  <section className="py-20 bg-warm-gray" id="branches">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-accent font-semibold text-sm tracking-wider uppercase">Our Network</span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mt-2">Branch Offices</h2>
        <p className="text-muted-foreground mt-3">Door pickup available in Chennai, Tamil Nadu & all major cities in India</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {branches.map((b, i) => (
          <motion.div
            key={b.city}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              <h3 className="font-display font-bold text-foreground text-sm">{b.city}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{b.address}</p>
            <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-xs font-semibold text-accent">
              <Phone className="w-3.5 h-3.5" />
              {b.phone}
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BranchesSection;
