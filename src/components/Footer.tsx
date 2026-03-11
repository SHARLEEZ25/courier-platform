import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";

const Footer = () => (
  <footer className="bg-footer-bg text-primary-foreground/70 py-16">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div>
          <span className="font-display font-bold text-lg text-primary block mb-3">Uniex Courier</span>
          <p className="text-sm leading-relaxed mb-4">
            Trusted international courier from Chennai to the world since 2006.
          </p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, MessageCircle].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-4">Services</h4>
          <div className="space-y-2 text-sm">
            <a href="https://uniex.in/service" className="block hover:text-primary transition-colors">Document Courier</a>
            <a href="https://uniex.in/service" className="block hover:text-primary transition-colors">University Express</a>
            <a href="https://uniex.in/service" className="block hover:text-primary transition-colors">Excess Baggage</a>
            <a href="https://uniex.in/service" className="block hover:text-primary transition-colors">On-Board Courier</a>
            <a href="https://uniex.in/service" className="block hover:text-primary transition-colors">Shop & Ship</a>
            <a href="https://uniex.in/service" className="block hover:text-primary transition-colors">Commercial Cargo</a>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-4">Company</h4>
          <div className="space-y-2 text-sm">
            <a href="https://uniex.in/about" className="block hover:text-primary transition-colors">About Us</a>
            <a href="https://uniex.in/news" className="block hover:text-primary transition-colors">News</a>
            <a href="https://uniex.in/contact" className="block hover:text-primary transition-colors">Contact Us</a>
            <a href="https://app.uniex.in/" className="block hover:text-primary transition-colors">Login / Register</a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-4">Contact</h4>
          <div className="space-y-3 text-sm">
            <a href="mailto:uniexanr@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4 text-primary" />
              uniexanr@gmail.com
            </a>
            <a href="tel:+919600879666" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4 text-primary" />
              +91 9600879666
            </a>
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
        © 2024 Uniex Courier. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
