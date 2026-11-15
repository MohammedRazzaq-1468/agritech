import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../../services/api.js';

export function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "How can I manage yellowing leaves on tomato plants?",
    "What is the best irrigation schedule for Wheat during crown root initiation?",
    "How do I prepare bio-fertilizers like Jeevamrutha or Vermicompost?",
    "What preventive measures control Fall Armyworm in Maize?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/message', {
        message: text,
        sessionId
      });

      if (res.success && res.data) {
        if (!sessionId && res.data.sessionId) {
          setSessionId(res.data.sessionId);
        }

        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.data.answer,
          category: res.data.category,
          suggestedFollowUps: res.data.suggested_follow_up_questions || [],
          warnings: res.data.warnings || [],
          requiresExpert: res.data.requires_expert
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. Please try asking again.',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[75vh] max-h-[750px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              AgriSmart AI Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-500">Ask any crop, soil, pest, or irrigation question</p>
          </div>
        </div>

        <button
          onClick={handleNewSession}
          className="text-xs font-semibold text-slate-600 hover:text-agri-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors flex items-center gap-1"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
            <div className="w-12 h-12 rounded-2xl bg-agri-50 text-agri-600 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">How can I assist your farm today?</h4>
            <p className="text-xs text-slate-500 mb-6">
              I can assist with disease diagnosis, fertilizer balancing, weather risks, and crop selection.
            </p>

            <div className="w-full space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Suggested Questions
              </p>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-2.5 rounded-xl text-xs bg-slate-50 hover:bg-agri-50 hover:text-agri-900 text-slate-700 border border-slate-100 hover:border-agri-200 transition-all font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-7 h-7 rounded-lg bg-agri-100 text-agri-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-agri-600 text-white rounded-br-xs'
                  : 'bg-slate-100/80 text-slate-800 rounded-bl-xs border border-slate-200/60'
              }`}>
                <p className="whitespace-pre-line">{msg.content}</p>

                {msg.warnings && msg.warnings.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-amber-800 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{msg.warnings[0]}</span>
                  </div>
                )}

                {/* Follow up suggestions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Follow-up Questions:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((fu, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(fu)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white text-agri-700 border border-slate-200 hover:border-agri-400 transition-colors"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-agri-100 text-agri-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-xs px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-agri-600" />
              <span>Dr. Emily / AgriSmart AI is formulating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about crops, fertilizer dosage, pests, or irrigation..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-agri-600 hover:bg-agri-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

