import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-[#0D0D0D] text-white" style={{ paddingTop: 64, paddingBottom: 32 }}>
    <div className="container">
      <div className="grid sm:grid-cols-2 lg:grid-cols-[35%_1fr_1fr_1fr] gap-10 mb-12">

        {/* Brand */}
        <div>
          <span className="text-[22px] font-black text-white tracking-tight mb-6 block">
            Courier<span className="text-[#4CAF50]">Pro</span>
          </span>
          <p className="text-sm text-[#6B7280] leading-[1.7] max-w-[240px] mb-5">
            Trusted international courier from Chennai since 2006.
            Delivering to 220+ countries worldwide.
          </p>
          <div className="flex gap-2">
            {[
              { Icon: Facebook, href: "https://facebook.com/courierpro" },
              { Icon: Instagram, href: "https://instagram.com/courierpro" },
              { Icon: MessageCircle, href: "https://wa.me/919600879666" },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-md bg-[#1A1A1A] flex items-center justify-center text-[#6B7280] hover:text-[#4CAF50] transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">Services</h4>
          <div className="space-y-2.5 text-sm">
            {[
              { label: "Students Courier", href: "/services#students-courier" },
              { label: "Indian Food & Medicines", href: "/services#indian-food-medicines" },
              { label: "Excess Baggage", href: "/services#excess-baggage" },
              { label: "On-Board Courier (OBC)", href: "/services#on-board-courier" },
              { label: "Export & Import", href: "/services#export-import" },
            ].map((s) => (
              <Link key={s.label} to={s.href} className="block text-[#6B7280] hover:text-white transition-colors leading-[2]">
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">Company</h4>
          <div className="space-y-2.5 text-sm">
            {[
              { label: "Home", href: "/" },
              { label: "About Us", href: "/about" },
              { label: "Services", href: "/services" },
              { label: "Get a Quote", href: "/get-quote" },
              { label: "Contact Us", href: "/contact" },
            ].map((l) => (
              <Link key={l.label} to={l.href} className="block text-[#6B7280] hover:text-white transition-colors leading-[2]">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">Contact</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Mail className="w-4 h-4 text-[#4CAF50] shrink-0" />
              support@courierpro.com
            </div>
            <div className="flex flex-col gap-1.5 text-[#6B7280]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#4CAF50] shrink-0" />
                +91 9600879666
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 shrink-0" />
                Sales: +91 9380839266
              </div>
            </div>
            <div className="flex items-start gap-2 text-[#6B7280] leading-normal">
              <MapPin className="w-4 h-4 text-[#4CAF50] shrink-0 mt-0.5" />
              <div>
                First Floor, Old No.4V, New No.7, Gayatri Villa,<br />
                Josier Street, Nungambakkam,<br />
                Chennai, Tamil Nadu 600034
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[#1A1A1A] pt-6 text-center text-xs text-[#6B7280]">
        © 2024 CourierPro. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
