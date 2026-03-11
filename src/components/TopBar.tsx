import { Mail, Phone } from "lucide-react";

const TopBar = () => (
  <div className="bg-navy text-primary-foreground py-2 text-sm">
    <div className="container flex items-center justify-between">
      <div className="flex items-center gap-6">
        <a href="mailto:uniexanr@gmail.com" className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
          <Mail className="w-3.5 h-3.5" />
          uniexanr@gmail.com
        </a>
        <a href="tel:+919600879666" className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
          <Phone className="w-3.5 h-3.5" />
          +91 9600879666
        </a>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <a href="https://app.uniex.in/" className="opacity-80 hover:opacity-100 transition-opacity">Login</a>
        <span className="opacity-40">/</span>
        <a href="https://app.uniex.in/" className="opacity-80 hover:opacity-100 transition-opacity">Register</a>
      </div>
    </div>
  </div>
);

export default TopBar;
