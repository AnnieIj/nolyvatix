import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { geminiService } from '../../services/api/gemini';
import { AIChatMessage } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X, Sparkles, Send, Bot, User, BarChart2, RefreshCw, Trash2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart as ReLineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SAMPLE_PROMPTS = [
  'Show USDC anchor corridor 30-day volume',
  'What is the WASM gas usage for Soroban contracts?',
  'Summarize Stellar ledger TPS and network health',
  'Compare USDC and EURC liquidity',
];

export const GeminiAICopilotDrawer: React.FC = () => {
  const aiCopilotOpen = useAppStore((s) => s.aiCopilotOpen);
  const toggleAICopilot = useAppStore((s) => s.toggleAICopilot);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'gemini',
      text: 'Hello! I am your Nolyvatix Gemini AI Co-Pilot. Ask me any natural language business intelligence question about the Stellar blockchain or Soroban smart contracts.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts: Alt+A or Cmd+K to toggle AI Copilot, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        toggleAICopilot();
      }
      if (e.key === 'Escape' && aiCopilotOpen) {
        toggleAICopilot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiCopilotOpen, toggleAICopilot]);

  useEffect(() => {
    if (aiCopilotOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiCopilotOpen]);

  const handleSend = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const responseMsg = await geminiService.processQuery(text, history);
      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'gemini',
          text: 'Apologies, I encountered an error communicating with the Gemini AI service.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearMessages = () => {
    setMessages([
      {
        id: `welc-${Date.now()}`,
        sender: 'gemini',
        text: 'Chat history cleared. How can I assist with your Stellar analysis?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {aiCopilotOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          id="ai-copilot-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Gemini AI Co-Pilot assistant"
          aria-labelledby="ai-copilot-title"
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-zinc-950/95 border-l border-zinc-800 backdrop-blur-2xl z-50 flex flex-col shadow-2xl text-zinc-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400" aria-hidden="true">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="ai-copilot-title" className="text-sm font-bold text-white">Gemini AI Co-Pilot</h3>
                  <Badge variant="info">Gemini 3.6</Badge>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">Press Alt+A or Cmd+K to toggle</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={clearMessages}
                aria-label="Clear chat history"
                title="Clear Chat"
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={toggleAICopilot}
                aria-label="Close Gemini AI Co-Pilot assistant"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            role="log"
            aria-live="polite"
            aria-label="AI Co-Pilot conversation"
            aria-atomic="false"
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'gemini' && (
                  <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-3 text-xs space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white font-medium self-end'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-1 text-[10px] font-mono text-zinc-400">
                    <span className="font-semibold text-sky-300">
                      {msg.sender === 'user' ? 'You' : 'Gemini AI'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.sender === 'gemini' && (
                        <button
                          onClick={() => copyText(msg.text, msg.id)}
                          aria-label={copiedId === msg.id ? 'Message copied to clipboard' : 'Copy message to clipboard'}
                          aria-pressed={copiedId === msg.id}
                          className="hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 rounded"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                          ) : (
                            <Copy className="w-3 h-3" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Render Dynamically Generated Chart */}
                  {msg.generatedChart && (
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 mt-2">
                      <div className="text-[11px] font-mono font-semibold text-sky-300 flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>{msg.generatedChart.title}</span>
                      </div>

                      <div className="h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          {msg.generatedChart.type === 'bar' ? (
                            <ReBarChart data={msg.generatedChart.data}>
                              <XAxis dataKey={msg.generatedChart.xAxisKey || 'category'} stroke="#71717a" fontSize={10} />
                              <YAxis stroke="#71717a" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '11px' }} />
                              <Bar dataKey={msg.generatedChart.dataKeys?.[0] || 'volume'} fill="#38bdf8" radius={[2, 2, 0, 0]} />
                            </ReBarChart>
                          ) : (
                            <ReLineChart data={msg.generatedChart.data}>
                              <XAxis dataKey={msg.generatedChart.xAxisKey || 'day'} stroke="#71717a" fontSize={10} />
                              <YAxis stroke="#71717a" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '11px' }} />
                              <Line type="monotone" dataKey={msg.generatedChart.dataKeys?.[0] || 'volume'} stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                            </ReLineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                      <span className="text-[9px] font-mono text-zinc-500">Suggested:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {msg.suggestedFollowups.map((f, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(f)}
                            className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 rounded text-[9px] font-mono text-sky-300 hover:text-white transition-colors"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div aria-hidden="true" className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Synthesizing Stellar ledger metrics...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts & Input Bar */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/90 space-y-2">
            <div role="group" aria-label="Quick prompt suggestions" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  aria-label={`Quick prompt: ${p}`}
                  className="px-2 py-1 bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 rounded text-[10px] font-mono text-zinc-400 hover:text-sky-300 whitespace-nowrap transition-colors shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="ai-copilot-input-prompt" className="sr-only">Ask Gemini a question about the Stellar blockchain</label>
              <input
                id="ai-copilot-input-prompt"
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Gemini natural questions..."
                aria-label="Ask Gemini a question about the Stellar blockchain"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-500"
              />
              <Button
                variant="primary"
                size="sm"
                isLoading={isLoading}
                onClick={() => handleSend()}
                aria-label={isLoading ? 'Sending message...' : 'Send message to Gemini AI'}
                className="shrink-0"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
