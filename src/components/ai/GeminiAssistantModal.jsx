import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { askGeminiAssistant } from '../../services/geminiService';

export default function GeminiAssistantModal({ isOpen, onClose, initialQuery = '', contextData = {} }) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy Gemini Flash AI, tu asistente operacional para Suministros Industriales Orión. ¿En qué licitación, producto o proveedor puedo ayudarte a investigar hoy?'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    const result = await askGeminiAssistant(userText, contextData);
    setLoading(false);

    if (result.success) {
      setMessages(prev => [...prev, { sender: 'bot', text: result.text }]);
    } else {
      setMessages(prev => [...prev, { sender: 'bot', text: `Error: ${result.error}` }]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-950 border-l border-zinc-900 flex flex-col h-full shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Asistente Gemini Flash AI</h2>
              <p className="text-[10px] text-zinc-500">Investigación operacional & sugerencias de proveedores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`p-1.5 rounded-full shrink-0 ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-blue-400 border border-zinc-700'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-blue-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini está razonando...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-zinc-900 bg-zinc-950 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pregunta sobre licitaciones, productos o precios..."
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
