import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/919600879666"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform duration-200 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
  >
    <MessageCircle className="w-6 h-6 fill-white" />
  </a>
);

export default WhatsAppButton;
