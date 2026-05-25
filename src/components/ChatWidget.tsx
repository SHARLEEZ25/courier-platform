import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Phone, Clock, ShieldCheck } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const KNOWLEDGE_BASE = [
  {
    keywords: ["ship", "delivery", "country", "destination", "reach", "usa", "uk", "canada", "australia", "dubai", "singapore"],
    response: "We deliver to over 220 countries including the USA, UK, Canada, Australia, Singapore, Dubai, and Malaysia. Our express delivery usually takes 2-5 business days to most top destinations! 🌍"
  },
  {
    keywords: ["medicine", "tablets", "prescription", "pharmacy"],
    response: "Yes, we specialized in medicine shipping! You'll need a valid prescription, the original bill, and a copy of the sender's Aadhaar card. We handle the rest. 💊"
  },
  {
    keywords: ["food", "sweets", "snacks", "pickles", "spices", "homemade"],
    response: "We love sending a taste of home! We ship sweets, snacks, pickles, spices, and homemade food items safely. We also provide free box packing in Chennai! 🍱"
  },
  {
    keywords: ["student", "university", "application", "documents"],
    response: "Students save over 50% with CourierPro! We prioritize university applications and documents to ensure they reach on time. 🎓"
  },
  {
    keywords: ["price", "cost", "rate", "quote", "charges", "cheap", "affordable"],
    response: "Our rates are some of the most competitive in India. You can get an instant estimate by clicking 'Get a Free Quote' in the options above! 💰"
  },
  {
    keywords: ["track", "status", "where", "package", "shipment"],
    response: "You can track your package in real-time on our website or via the link sent to your WhatsApp. Just enter your tracking ID! 📍"
  },
  {
    keywords: ["pickup", "home", "chennai", "india"],
    response: "We offer free door-to-door pickup across Chennai and all major cities in India. Just let us know your location! 🚚"
  }
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "👋 Hi there! I'm your CourierPro assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const WHATSAPP_NUMBER = "919600879666";

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText.toLowerCase();
    setInputText("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      let botResponse = "";
      const match = KNOWLEDGE_BASE.find(k => 
        k.keywords.some(kw => currentInput.includes(kw))
      );

      if (match) {
        botResponse = match.response;
      } else {
        botResponse = "I'm still learning! For specific queries like this, would you like to speak directly with one of our logistics experts on WhatsApp? ↘️";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickAction = (action: string) => {
    let text = "";
    if (action === "quote") text = "Hi CourierPro! I'd like to get a shipping quote.";
    if (action === "track") text = "Hello! I want to track my shipment.";
    if (action === "expert") text = "Hi! I need to speak with a logistics expert.";
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-4 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[520px]"
          >
            {/* Header */}
            <div className="bg-[#0D0D0D] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-green-primary flex items-center justify-center font-bold text-lg">
                    U
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0D0D0D] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none mb-1">CourierPro Assistant</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Online & Ready to Help
                  </div>
                </div>
              </div>
              <button 
                onClick={toggleChat}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F9FBFA]">
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex flex-col gap-1.5 ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div 
                    className={`max-w-[85%] p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm border ${
                      m.sender === "user" 
                        ? "bg-green-primary text-white border-green-primary rounded-tr-sm" 
                        : "bg-white text-gray-700 border-gray-100 rounded-tl-sm"
                    }`}
                  >
                    {m.text}
                    {m.text.includes("↘️") && (
                      <button 
                        onClick={() => handleQuickAction("expert")}
                        className="mt-3 w-full py-2 bg-[#25D366] text-white rounded-lg flex items-center justify-center gap-2 font-bold text-[12px] hover:bg-[#20bd5a] transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 fill-white" /> Chat on WhatsApp
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium px-1">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex flex-col gap-1.5 items-start">
                  <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  </div>
                </div>
              )}

              {/* Quick Actions at the very start or when bot asks */}
              {messages.length === 1 && !isTyping && (
                <div className="space-y-2.5 pt-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Quick Links</p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleQuickAction("quote")}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:border-green-primary hover:text-green-primary transition-all shadow-sm"
                    >
                      Get Quote
                    </button>
                    <button 
                      onClick={() => handleQuickAction("track")}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:border-green-primary hover:text-green-primary transition-all shadow-sm"
                    >
                      Track
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0"
            >
              <input
                type="text"
                placeholder="Ask about USA, medicine, food, etc..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-[14px] outline-none placeholder:text-gray-400 py-2"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 bg-green-primary text-white rounded-xl hover:bg-green-dark transition-all disabled:opacity-50 disabled:bg-gray-200"
              >
                <Send className="w-4 h-4 fill-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-white text-gray-900 border border-gray-100" : "bg-[#25D366] text-white"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-8 h-8 fill-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
