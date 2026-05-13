import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, MessageCircle, Facebook, Twitter, Instagram, 
  ChevronDown, Calculator, Search, ExternalLink, CheckCircle2 
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Animation settings
const fadeUpProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
};

const Contact = () => {
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success">("idle");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  const faqs = [
    {
      q: "How do I get a shipping rate?",
      a: "You can use the Rate Calculator on our homepage — enter your destination and package weight for an instant estimate. For bulk or commercial shipments, call us directly."
    },
    {
      q: "Do you offer door pickup from my city?",
      a: "Yes. We offer door pickup from Chennai, Tamil Nadu, and all major cities across India including Mumbai, Delhi, Bangalore, Hyderabad, Pune, and more."
    },
    {
      q: "How long does international delivery take?",
      a: "It depends on the destination and service selected. Express shipments to the USA or UK typically take 2–5 business days. Economy options take longer but cost less."
    },
    {
      q: "Can I send food items and medicines abroad?",
      a: "Yes. We ship Indian food items, spices, and life-saving medicines internationally. Medicine courier requires a prescription, medicine bill, and sender Aadhaar card."
    },
    {
      q: "What documents do I need to ship a parcel?",
      a: "For most shipments — a valid ID and the receiver's address. Commercial shipments may require an invoice. We guide you through the paperwork at no extra cost."
    },
    {
      q: "Do you handle customs clearance?",
      a: "Yes. We provide full customs documentation support for both export and import shipments."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#0D0D0D]">
      <Header />

      <main>
        {/* SECTION 1 — PAGE HERO */}
        <section className="bg-white pt-[72px] pb-[80px] max-md:pt-[40px] max-md:pb-[48px]">
          <div className="max-w-[1248px] mx-auto px-4 md:px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="text-[12px] font-medium text-[#9CA3AF] mb-[12px]">
                Home <span className="mx-1">›</span> <span className="text-[#374151]">Contact</span>
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">
                GET IN TOUCH
              </p>
              <h1 className="text-[28px] md:text-[40px] lg:text-[52px] font-extrabold text-[#0D0D0D] leading-[1.1] tracking-[-0.03em] max-w-[560px] mb-[16px]">
                We're here whenever<br />you need us.
              </h1>
              <p className="text-[17px] font-normal text-[#6B7280] leading-[1.75] max-w-[480px]">
                Have a question about shipping rates, pickup, customs, or tracking? Reach out — our team responds fast.
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 — CONTACT DETAILS + FORM */}
        <section className="bg-white pb-[100px] max-md:pb-[56px]">
          <div className="max-w-[1248px] mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-start gap-[32px] lg:gap-[80px]">
              
              {/* LEFT COLUMN: Contact Details */}
              <div className="w-full lg:w-[38%] shrink-0">
                {/* Email Block */}
                <motion.div 
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-[36px]"
                >
                  <Mail className="w-[20px] h-[20px] text-[#4CAF50] mb-[12px]" />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[4px]">
                    EMAIL US
                  </div>
                  <div className="text-[16px] font-semibold text-[#0D0D0D]">
                    uniexanr@gmail.com
                  </div>
                  <div className="text-[13px] text-[#6B7280] mt-[2px]">
                    We reply within a few hours.
                  </div>
                </motion.div>

                {/* Phone Block */}
                <motion.div 
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                  className="mb-[36px]"
                >
                  <Phone className="w-[20px] h-[20px] text-[#4CAF50] mb-[12px]" />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[4px]">
                    CALL OR WHATSAPP
                  </div>
                  <div className="text-[16px] font-semibold text-[#0D0D0D]">
                    +91 9600879666
                  </div>
                  <div className="text-[14px] font-medium text-[#374151] mt-[2px]">
                    +91 9380839266 <span className="text-[#6B7280] font-normal ml-1">(Sales & Support)</span>
                  </div>
                  <div className="text-[13px] text-[#6B7280] mt-[4px]">
                    Monday to Saturday · 9 AM – 7 PM IST
                  </div>
                </motion.div>

                {/* Address Block */}
                <motion.div 
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.24, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                  className="mb-[40px]"
                >
                  <MapPin className="w-[20px] h-[20px] text-[#4CAF50] mb-[12px]" />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[4px]">
                    VISIT US
                  </div>
                  <div className="text-[16px] font-medium text-[#0D0D0D] leading-[1.8] max-w-[280px]">
                    First Floor, Old No.4V, New No.7,<br />
                    Gayatri Villa, Josier Street,<br />
                    Nungambakkam, Chennai,<br />
                    Tamil Nadu 600034
                  </div>
                </motion.div>

                {/* WhatsApp CTA */}
                <motion.a 
                  href="https://wa.me/919600879666"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.36, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center justify-center gap-[8px] border-[1.5px] border-[#4CAF50] text-[#4CAF50] bg-transparent hover:bg-[#F1F8F1] transition-colors rounded-[8px] px-[24px] py-[12px] text-[14px] font-semibold"
                >
                  <MessageCircle className="w-[18px] h-[18px]" />
                  Message Us on WhatsApp
                </motion.a>

                <div className="h-px bg-[#E5E7EB] w-full mt-[40px] mb-[24px]" />

                {/* Social Row */}
                <motion.div 
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.48, duration: 0.5 }}
                >
                  <div className="text-[12px] font-medium text-[#9CA3AF] mb-[12px]">Follow us</div>
                  <div className="flex items-center gap-[12px]">
                    {[
                      { Icon: Facebook, href: "https://facebook.com/uniexcourier" },
                      { Icon: Twitter, href: "https://twitter.com/uniexcourier" },
                      { Icon: Instagram, href: "https://instagram.com/uniexcourier" },
                      { Icon: MessageCircle, href: "https://wa.me/919600879666" }
                    ].map(({ Icon, href }, i) => (
                      <a 
                        key={i} 
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[32px] h-[32px] rounded-[6px] bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#4CAF50] flex items-center justify-center group transition-colors"
                      >
                        <Icon className="w-[16px] h-[16px] text-[#6B7280] group-hover:text-[#4CAF50] transition-colors" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: Contact Form */}
              <motion.div {...fadeUpProps} className="w-full flex-1">
                <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] md:p-[40px]">
                  
                  {formStatus === "success" ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center py-[40px]"
                    >
                      <div className="w-[48px] h-[48px] rounded-full bg-[#E8F5E9] flex items-center justify-center mb-[20px]">
                        <CheckCircle2 className="w-[28px] h-[28px] text-[#4CAF50]" />
                      </div>
                      <h3 className="text-[20px] font-bold text-[#0D0D0D] mb-[8px]">Message Sent!</h3>
                      <p className="text-[14px] text-[#6B7280] mb-[32px] max-w-[280px]">
                        Thanks for reaching out. Our team will get back to you within a few hours.
                      </p>
                      <button 
                        onClick={() => setFormStatus("idle")}
                        className="border-[1.5px] border-[#4CAF50] text-[#4CAF50] bg-transparent hover:bg-[#F1F8F1] transition-colors rounded-[8px] px-[24px] py-[12px] text-[14px] font-semibold"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="text-[20px] font-bold text-[#0D0D0D] mb-[4px]">Send us a message</h2>
                      <p className="text-[14px] text-[#6B7280] mb-[32px]">
                        Fill in the details below and we'll get back to you shortly.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-[20px]">
                        {/* Row 1 */}
                        <div className="grid md:grid-cols-2 gap-[16px]">
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                          >
                            <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">Full Name</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Rahul Sharma"
                              className="w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.15)] transition-shadow"
                            />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28, duration: 0.4 }}
                          >
                            <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">Phone Number</label>
                            <input 
                              type="tel" 
                              required
                              placeholder="+91 98765 43210"
                              className="w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.15)] transition-shadow"
                            />
                          </motion.div>
                        </div>

                        {/* Row 2 */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.36, duration: 0.4 }}
                        >
                          <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="you@example.com"
                            className="w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.15)] transition-shadow"
                          />
                        </motion.div>

                        {/* Row 3 Select */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.44, duration: 0.4 }}
                        >
                          <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">What is this about?</label>
                          <select 
                            required
                            defaultValue=""
                            className="w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] outline-none text-[#0D0D0D] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.15)] transition-shadow appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                          >
                            <option value="" disabled className="text-[#9CA3AF]">Select a topic...</option>
                            <option value="rates">Shipping Rates & Quotes</option>
                            <option value="book">Book a Shipment</option>
                            <option value="track">Track an Existing Order</option>
                            <option value="shop-ship">Shop & Ship Enquiry</option>
                            <option value="obc">On-Board Courier (OBC)</option>
                            <option value="excess">Excess Baggage</option>
                            <option value="medicine">Medicine Courier</option>
                            <option value="commercial">Commercial Cargo & Export</option>
                            <option value="general">General Enquiry</option>
                          </select>
                        </motion.div>

                        {/* Row 4 Textarea */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.52, duration: 0.4 }}
                        >
                          <label className="block text-[13px] font-medium text-[#374151] mb-[6px]">Your Message</label>
                          <textarea 
                            required
                            rows={5}
                            placeholder="Tell us more about what you need — destination, weight, timeline, or any specific requirements."
                            className="w-full bg-white border border-[#E5E7EB] rounded-[8px] px-[16px] py-[12px] text-[15px] outline-none placeholder:text-[#9CA3AF] focus:border-[#4CAF50] focus:ring-[3px] focus:ring-[rgba(76,175,80,0.15)] transition-shadow resize-y"
                          />
                        </motion.div>

                        {/* Checkbox */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.4 }}
                          className="flex items-start gap-[12px] mt-[8px]"
                        >
                          <div className="pt-1">
                            <input type="checkbox" required className="w-[16px] h-[16px] accent-[#4CAF50] cursor-pointer" />
                          </div>
                          <p className="text-[13px] text-[#6B7280] leading-[1.5]">
                            I agree to be contacted by the Uniex team regarding my enquiry.
                          </p>
                        </motion.div>

                        {/* Submit */}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.68, duration: 0.4 }}
                          className="pt-[4px]"
                        >
                          <button 
                            type="submit" 
                            disabled={formStatus === "loading"}
                            className="w-full bg-[#4CAF50] hover:bg-[#3D9940] disabled:bg-[#3D9940] disabled:opacity-80 text-white font-semibold text-[15px] px-[14px] py-[14px] rounded-[8px] transition-colors flex justify-center items-center gap-[8px]"
                          >
                            {formStatus === "loading" ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Sending…
                              </>
                            ) : (
                              <>Send Message <span className="text-[18px] leading-none">→</span></>
                            )}
                          </button>
                        </motion.div>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SECTION 3 — OFFICE MAP */}
        <section className="bg-[#F1F8F1] py-[80px] max-md:py-[48px]">
          <div className="max-w-[1248px] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-[32px] lg:gap-[100px]">
              
              <motion.div {...fadeUpProps} className="w-full md:w-[45%] shrink-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">OUR LOCATION</p>
                <h2 className="text-[32px] md:text-[36px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em] mb-[40px]">
                  Find us in<br />Nungambakkam, Chennai.
                </h2>

                <div className="mb-[28px]">
                  <div className="text-[18px] font-bold text-[#0D0D0D]">Gayatri Villa, Josier Street</div>
                  <div className="text-[15px] text-[#6B7280] leading-[1.8] mt-[8px]">
                    First Floor, Old No.4V, New No.7,<br />
                    Nungambakkam, Chennai, Tamil Nadu 600034
                  </div>
                  <div className="text-[13px] text-[#9CA3AF] italic mt-[16px]">
                    Near Nungambakkam Metro Station
                  </div>
                </div>

                <div className="w-full h-px bg-[#E5E7EB] my-[28px]" />

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-[12px]">OFFICE HOURS</div>
                  <div className="flex justify-between items-center text-[14px] text-[#374151] mb-[8px]">
                    <span>Monday – Friday</span>
                    <span className="font-medium">9:00 AM – 7:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px] text-[#374151] mb-[8px]">
                    <span>Saturday</span>
                    <span className="font-medium">9:00 AM – 5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px] text-[#374151]">
                    <span>Sunday</span>
                    <span className="text-[#EF4444] font-medium">Closed</span>
                  </div>
                </div>

                <a 
                  href="https://maps.google.com/?q=Josier+Street+Nungambakkam+Chennai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-[8px] bg-[#0D0D0D] text-white hover:bg-[#1E1E1E] transition-colors rounded-[8px] px-[24px] py-[12px] text-[14px] font-semibold mt-[28px]"
                >
                  Get Directions <ExternalLink className="w-[16px] h-[16px]" />
                </a>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full md:w-[52%]"
              >
                <iframe
                  src="https://maps.google.com/maps?q=Josier+Street,+Nungambakkam,+Chennai,+Tamil+Nadu+600034&output=embed"
                  width="100%"
                  height="380"
                  style={{ border: "1px solid #E5E7EB", borderRadius: "12px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="max-md:h-[260px]"
                ></iframe>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SECTION 4 — QUICK CONTACT CARDS */}
        <section className="bg-white py-[80px] max-md:py-[48px]">
          <div className="max-w-[1248px] mx-auto px-4 md:px-6">
            <motion.div {...fadeUpProps} className="text-center mb-[48px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">QUICK LINKS</p>
              <h2 className="text-[36px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em] mb-[16px]">Not sure where to start?</h2>
              <p className="text-[16px] text-[#6B7280]">Go straight to what you need.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-[24px]">
              <motion.div 
                {...fadeUpProps} transition={{ delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="border border-[#E5E7EB] hover:border-[#4CAF50] transition-all duration-200 rounded-[16px] p-[32px] flex flex-col items-start bg-white"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#F1F8F1] flex items-center justify-center mb-[20px]">
                  <Calculator className="w-[20px] h-[20px] text-[#4CAF50]" />
                </div>
                <h3 className="text-[20px] font-bold text-[#0D0D0D] mb-[12px]">Get an Instant Quote</h3>
                <p className="text-[15px] text-[#6B7280] leading-[1.6] mb-[24px] flex-1">
                  Enter your destination and package weight to get a shipping rate estimate in seconds.
                </p>
                <a href="/get-quote" className="text-[#4CAF50] text-[13px] font-bold uppercase tracking-[0.05em] flex items-center gap-[4px] group">
                  Calculate Rates <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </motion.div>

              <motion.div 
                {...fadeUpProps} transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="border border-[#E5E7EB] hover:border-[#4CAF50] transition-all duration-200 rounded-[16px] p-[32px] flex flex-col items-start bg-white"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#F1F8F1] flex items-center justify-center mb-[20px]">
                  <Search className="w-[20px] h-[20px] text-[#4CAF50]" />
                </div>
                <h3 className="text-[20px] font-bold text-[#0D0D0D] mb-[12px]">Track Your Shipment</h3>
                <p className="text-[15px] text-[#6B7280] leading-[1.6] mb-[24px] flex-1">
                  Already shipped with us? Enter your tracking number to get live status updates.
                </p>
                <span className="text-[#4CAF50] text-[13px] font-bold uppercase tracking-[0.05em] flex items-center gap-[4px] group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                  Track Now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </motion.div>

              <motion.div 
                {...fadeUpProps} transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
                className="border border-[#E5E7EB] hover:border-[#4CAF50] transition-all duration-200 rounded-[16px] p-[32px] flex flex-col items-start bg-white"
              >
                <div className="w-[40px] h-[40px] rounded-full bg-[#F1F8F1] flex items-center justify-center mb-[20px]">
                  <MessageCircle className="w-[20px] h-[20px] text-[#4CAF50]" />
                </div>
                <h3 className="text-[20px] font-bold text-[#0D0D0D] mb-[12px]">WhatsApp Us Directly</h3>
                <p className="text-[15px] text-[#6B7280] leading-[1.6] mb-[24px] flex-1">
                  Prefer to chat? Message our team on WhatsApp for quick answers on rates, pickup, and bookings.
                </p>
                <a href="https://wa.me/919600879666" target="_blank" rel="noopener noreferrer" className="text-[#4CAF50] text-[13px] font-bold uppercase tracking-[0.05em] flex items-center gap-[4px] group">
                  Open WhatsApp <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — FAQ STRIP */}
        <section className="bg-[#F1F8F1] py-[80px] max-md:py-[48px]">
          <div className="max-w-[800px] mx-auto px-4 md:px-6">
            <motion.div {...fadeUpProps} className="text-center mb-[48px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4CAF50] mb-[12px]">COMMON QUESTIONS</p>
              <h2 className="text-[32px] md:text-[36px] font-bold text-[#0D0D0D] leading-[1.2] tracking-[-0.02em]">Quick answers before<br />you reach out.</h2>
            </motion.div>

            <div className="border-t border-[#E5E7EB]">
              {faqs.map((faq, i) => (
                <motion.div 
                  key={i}
                  {...fadeUpProps} transition={{ delay: i * 0.1 }}
                  className="border-b border-[#E5E7EB]"
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full py-[20px] flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-[15px] font-semibold text-[#0D0D0D] pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <ChevronDown className="w-[20px] h-[20px] text-[#6B7280] shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-[20px] text-[14px] text-[#6B7280] leading-[1.75] pr-12">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 — BOTTOM CTA BANNER */}
        <section className="bg-[#0D0D0D] py-[56px] md:py-[80px]">
          <div className="max-w-[800px] mx-auto px-4 md:px-6 text-center">
            <motion.div {...fadeUpProps}>
              <div className="inline-flex items-center justify-center bg-[#1A1A1A] border border-[#2E7D32] text-[#4CAF50] rounded-full px-[16px] py-[6px] text-[11px] font-bold uppercase tracking-[0.08em] mb-[24px]">
                STILL HAVE QUESTIONS?
              </div>
              <h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold text-white leading-[1.15] tracking-[-0.02em] mb-[12px]">
                Talk to our team.<br />We respond fast.
              </h2>
              <p className="text-[13px] text-[#9CA3AF]">
                Call, WhatsApp, or email us — whichever works best for you.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-[12px] mt-[36px]">
                <a href="tel:+919600879666" className="w-full sm:w-auto inline-flex items-center justify-center bg-[#4CAF50] hover:bg-[#3D9940] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors">
                  Call +91 9600879666
                </a>
                <a href="mailto:uniexanr@gmail.com" className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border border-[#374151] hover:border-[#6B7280] hover:bg-[#1A1A1A] text-white rounded-[8px] px-[24px] py-[12px] text-[15px] font-semibold transition-colors">
                  Send a Message
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

export default Contact;
