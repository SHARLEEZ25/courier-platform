import { Mail, Phone } from "lucide-react";

const TopBar = () => (
  <div className="bg-green-deep text-white" style={{ height: 36 }}>
    <div className="container h-full flex items-center justify-between">
      <div className="flex items-center gap-4 text-xs font-medium">
        <a href="mailto:uniexanr@gmail.com" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
          <Mail className="w-3 h-3" />
          uniexanr@gmail.com
        </a>
        <span className="opacity-40">·</span>
        <a href="tel:+919600879666" className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
          <Phone className="w-3 h-3" />
          +91 9600879666
        </a>
      </div>
      <div className="flex items-center gap-3 text-xs font-medium">
        <a href="https://app.uniex.in/" className="opacity-90 hover:opacity-100 transition-opacity">Login</a>
        <span className="opacity-30">|</span>
        <a href="https://app.uniex.in/" className="opacity-90 hover:opacity-100 transition-opacity">Register</a>
      </div>
    </div>
  </div>
);

export default TopBar;
