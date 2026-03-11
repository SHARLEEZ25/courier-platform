import { motion } from "framer-motion";
import { Pill, FileCheck, CreditCard } from "lucide-react";

const MedicineCourierSection = () => (
  <section className="py-16 bg-accent/5 border-y border-accent/10">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <Pill className="w-4 h-4" />
          Medicine Courier
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4">
          Send Life-Saving Medicines Worldwide
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          We send life-saving medicines to all over the world from India with the cheapest rate and reliable service.
        </p>

        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-foreground">₹3,000</div>
            <div className="text-sm text-muted-foreground">500 grams</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-foreground">₹3,500</div>
            <div className="text-sm text-muted-foreground">1 kg</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-accent" />
            Prescription Required
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-accent" />
            Medicine Bill Required
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-accent" />
            Sender Aadhar Required
          </div>
        </div>

        <a
          href="http://uniex.in/"
          className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold shadow-button hover:brightness-110 transition"
        >
          Book Now
        </a>
        <p className="text-xs text-muted-foreground mt-4">*Subject to Custom Clearance</p>
      </motion.div>
    </div>
  </section>
);

export default MedicineCourierSection;
