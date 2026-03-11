import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-navy-dark text-primary-foreground/70 py-16">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-accent rounded-lg p-2">
              <span className="font-display font-extrabold text-xl text-accent-foreground leading-none">U</span>
            </div>
            <div>
              <span className="font-display font-bold text-lg text-primary-foreground">Uniex</span>
              <span className="block text-[10px] tracking-widest uppercase text-primary-foreground/40">Courier & Cargo</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            Your trusted partner for reliable and cost-effective parcel delivery from India to 200+ countries.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-4">Quick Links</h4>
          <div className="space-y-2 text-sm">
            <a href="https://uniex.in/about" className="block hover:text-accent transition-colors">About</a>
            <a href="https://uniex.in/service" className="block hover:text-accent transition-colors">Services</a>
            <a href="https://uniex.in/pricing" className="block hover:text-accent transition-colors">Pricing</a>
            <a href="https://uniex.in/faq" className="block hover:text-accent transition-colors">FAQ</a>
            <a href="https://uniex.in/contact" className="block hover:text-accent transition-colors">Contact</a>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-4">Recent Posts</h4>
          <div className="space-y-2 text-sm">
            <a href="https://uniex.in/news/view/37" className="block hover:text-accent transition-colors">Medicine Courier from India</a>
            <a href="https://uniex.in/news/view/36" className="block hover:text-accent transition-colors">USA Tariff Regulations</a>
            <a href="https://uniex.in/news/view/35" className="block hover:text-accent transition-colors">USA Courier from India – Full Guide</a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-4">Address</h4>
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>First Floor, Old No.4V, New No.7, Gayatri Villa, Josier Street, Nungambakkam, Chennai - 600034</span>
            </div>
            <a href="tel:+919380839266" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Phone className="w-4 h-4 text-accent" />
              +91 9380839266
            </a>
            <a href="mailto:uniexanr@gmail.com" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Mail className="w-4 h-4 text-accent" />
              uniexanr@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 pt-6 flex flex-wrap justify-between items-center gap-4 text-xs text-primary-foreground/40">
        <span>Copyright © 2024, Uniex Courier and Cargo</span>
        <div className="flex gap-4">
          <a href="https://uniex.in/terms-and-conditions" className="hover:text-accent transition-colors">Terms & Conditions</a>
          <a href="https://uniex.in/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
