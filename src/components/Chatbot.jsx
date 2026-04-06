import { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export function Chatbot({ destination }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi! I'm your Wanderlust assistant. Ask me anything about ${destination || 'your trip'}!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      const response = await fetch(
        `https://open.bigmodel.cn/api/paas/v4/chat/completions`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}` 
          },
          body: JSON.stringify({
            model: "glm-4.5-flash",
            messages: [
              { role: "system", content: "You are a helpful travel assistant for a web app called Wanderlust. Provide concise, helpful responses (max 3 sentences)." },
              { role: "user", content: `User is planning a trip to ${destination || 'their destination'}. Question: ${currentInput}` }
            ]
          })
        }
      );

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";
      
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (error) {
      console.error("Gemini AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to my AI brain right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen ? (
        <GlassCard className="w-80 h-[450px] flex flex-col shadow-2xl p-0 overflow-hidden border-brand-200 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-brand-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <span className="font-bold block text-sm">Wanderlust AI</span>
                <span className="text-[10px] text-brand-100 flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                  Online Assistant
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-brand-700 p-1.5 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-200' 
                    : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-grow text-sm outline-none px-3 py-2 bg-slate-50 rounded-xl focus:ring-1 focus:ring-brand-200 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-brand-600 text-white p-2.5 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-200"
            >
              <Send size={18} />
            </button>
          </div>
        </GlassCard>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-brand-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group relative"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          <MessageSquare size={24} />
          <span className="font-bold pr-1">Ask AI</span>
        </button>
      )}
    </div>
  );
}
