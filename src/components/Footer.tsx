import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";

const Footer = () => (
  <footer className="bg-charcoal text-white" style={{ paddingTop: 64, paddingBottom: 32 }}>
    <div className="container">
      <div className="grid sm:grid-cols-2 lg:grid-cols-[35%_1fr_1fr_1fr] gap-10 mb-12">
        {/* Brand */}
        <div>
          <p className="text-lg font-bold mb-3">
            Uniex <span className="text-green-primary">Courier</span>
          </p>
          <p className="text-sm text-[hsl(var(--gray-500))] leading-[1.7] max-w-[240px] mb-5">
            Trusted international courier from Chennai since 2006.
            Delivering to 220+ countries worldwide.
          </p>
          <div className="flex gap-2">
            {[Facebook, Twitter, Instagram, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 rounded-md bg-[#2A2A2A] flex items-center justify-center text-[hsl(var(--gray-500))] hover:text-green-primary transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--gray-500))] mb-4">
            Services
          </h4>
          <div className="space-y-2.5 text-sm">
            {["Document Courier", "University Express", "Excess Baggage", "On-Board Courier", "Shop & Ship", "Commercial Cargo"].map((s) => (
              <a key={s} href="https://uniex.in/service" className="block text-[hsl(var(--gray-500))] hover:text-white transition-colors leading-[2]">
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--gray-500))] mb-4">
            Company
          </h4>
          <div className="space-y-2.5 text-sm">
            {[
              { label: "About Us", url: "https://uniex.in/about" },
              { label: "News", url: "https://uniex.in/news" },
              { label: "Contact Us", url: "https://uniex.in/contact" },
              { label: "Login", url: "https://app.uniex.in/" },
              { label: "Register", url: "https://app.uniex.in/" },
            ].map((l) => (
              <a key={l.label} href={l.url} className="block text-[hsl(var(--gray-500))] hover:text-white transition-colors leading-[2]">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[hsl(var(--gray-500))] mb-4">
            Contact
          </h4>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-[hsl(var(--gray-500))]">
              <Mail className="w-3.5 h-3.5 text-green-primary" />
              uniexanr@gmail.com
            </div>
            <div className="flex items-center gap-2 text-[hsl(var(--gray-500))]">
              <Phone className="w-3.5 h-3.5 text-green-primary" />
              +91 9600879666
            </div>
            <div className="flex items-start gap-2 text-[hsl(var(--gray-500))]">
              <MapPin className="w-3.5 h-3.5 text-green-primary shrink-0 mt-0.5" />
              Chennai, Tamil Nadu, India
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[#2A2A2A] pt-6 text-center text-xs text-[hsl(var(--gray-500))]">
        © 2024 Uniex Courier. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
