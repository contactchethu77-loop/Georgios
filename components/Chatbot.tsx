
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Languages, Sparkles, Loader2, Volume2 } from 'lucide-react';
import { ChatMessage, Product } from '../types';
import { chatWithAssistant } from '../services/geminiService';

interface ChatbotProps {
  products: Product[];
}

export const Chatbot: React.FC<ChatbotProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'Namaste! I am Georgios AI. How can I help you today? \nನಮಸ್ತೆ! ನಾನು ಜಾರ್ಜಿಯೋಸ್ AI. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? \nनमस्ते! मैं जॉर्जीओस एआई हूं। मैं आज आपकी कैसे मदद कर सकता हूं?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Kannada' | 'Hindi'>('English');
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = { role: 'user', text: textToSend };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const response = await chatWithAssistant(textToSend, history, products, language);
    setHistory(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in your browser.");
        return;
      }
      const langCodes = { 'English': 'en-IN', 'Kannada': 'kn-IN', 'Hindi': 'hi-IN' };
      recognitionRef.current.lang = langCodes[language];
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes = { 'English': 'en-IN', 'Kannada': 'kn-IN', 'Hindi': 'hi-IN' };
    utterance.lang = langCodes[language];
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all group animate-bounce ring-8 ring-emerald-100"
        >
          <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {isOpen && (
        <div className="glass-card w-[380px] h-[550px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white animate-in slide-in-from-bottom-10">
          <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <Sparkles className="animate-pulse" size={20} />
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest"><strong>Georgios AI</strong></h3>
                <p className="text-[8px] font-bold uppercase opacity-80 tracking-widest"><strong>Live Market Helper</strong></p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="bg-gray-50/50 p-2 flex gap-1 border-b border-gray-100 shrink-0">
            {(['English', 'Kannada', 'Hindi'] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${language === l ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400'}`}>
                <strong>{l}</strong>
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/40">
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none font-bold' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none font-bold'
                } shadow-sm group relative`}>
                  <strong>{msg.text}</strong>
                  {msg.role === 'model' && (
                    <button onClick={() => speakText(msg.text)} className="absolute -right-10 bottom-0 p-2 text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white shrink-0 border-t border-gray-100">
            <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <button 
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white text-emerald-600 shadow-sm'}`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Ask prices, help..."}
                className="flex-1 bg-transparent border-none text-sm font-bold p-2 outline-none"
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg disabled:opacity-50 active:scale-95 transition-all">
                <Send size={20} />
              </button>
            </div>
            <p className="text-[8px] text-gray-400 mt-3 font-black uppercase text-center tracking-widest"><strong>Voice support for English, ಕನ್ನಡ, and हिंदी</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};
