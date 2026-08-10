import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../../services/api/gemini';
import { AIChatMessage } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  BarChart2,
  MessageSquare,
  RefreshCw,
  Cpu,
  Wallet,
  Coins,
  ArrowRightLeft,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChatSession {
  id: string;
  title: string;
  messages: AIChatMessage[];
  updatedAt: string;
}

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#fbbf24'];

export const CopilotChatSection: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'Stellar Ledger Pulse & Assets',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-msg',
          sender: 'gemini',
          text: 'Welcome to the Nolyvatix Enterprise Gemini AI Intelligence Platform. Ask any natural language question about the Stellar Network, wallet risk metrics, asset trustline growth, DEX order depth, or Soroban smart contract performance.',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  const createNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Analysis Session',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `welc-${Date.now()}`,
          sender: 'gemini',
          text: 'New AI Copilot session initialized. How can I assist with your Stellar blockchain analysis today?',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(sessions.find((s) => s.id !== id)?.id || sessions[0].id);
    }
  };

  const handleSend = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    // Update session title if first prompt
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const isDefaultTitle = s.title.includes('New Analysis');
          return {
            ...s,
            title: isDefaultTitle ? text.slice(0, 32) + '...' : s.title,
            messages: [...s.messages, userMsg],
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    if (!promptToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const historyForApi = currentSession.messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const responseMsg = await geminiService.processQuery(text, historyForApi);

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, responseMsg],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );
    } catch (err) {
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'gemini',
        text: 'Apologies, I encountered an error communicating with the Gemini AI service. Please verify server telemetry.',
        timestamp: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const exportChatHistory = (format: 'markdown' | 'json') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(currentSession.messages, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nolyvatix-ai-session-${currentSession.id}.json`;
      a.click();
    } else {
      let md = `# Nolyvatix Gemini AI Copilot - ${currentSession.title}\nDate: ${new Date().toLocaleDateString()}\n\n`;
      currentSession.messages.forEach((m) => {
        md += `### ${m.sender === 'user' ? 'User Query' : 'Gemini AI Response'} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.text}\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nolyvatix-ai-session-${currentSession.id}.md`;
      a.click();
    }
  };

  const promptCategories = [
    { label: 'All', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { label: 'Network', icon: <Cpu className="w-3.5 h-3.5" /> },
    { label: 'Wallets', icon: <Wallet className="w-3.5 h-3.5" /> },
    { label: 'Assets', icon: <Coins className="w-3.5 h-3.5" /> },
    { label: 'DEX & Pools', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
    { label: 'Soroban', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const suggestedPrompts = [
    { category: 'Network', text: "Summarize today's Stellar ledger close rate, TPS, and operational health." },
    { category: 'Wallets', text: 'Analyze account risk indicators and balance distribution for active stablecoin senders.' },
    { category: 'Assets', text: 'Show me assets with the fastest trustline growth velocity over the past 30 days.' },
    { category: 'DEX & Pools', text: 'Which AMM liquidity pools generated the highest fee yield for LP holders today?' },
    { category: 'Soroban', text: 'Compare WASM CPU gas consumption and invocation success rates across top contracts.' },
    { category: 'Network', text: 'Generate a line chart comparing 24-hour USD settlement volume across anchors.' },
  ];

  const filteredPrompts =
    activeCategory === 'All' ? suggestedPrompts : suggestedPrompts.filter((p) => p.category === activeCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[780px]">
      {/* Session Sidebar */}
      <Card className="lg:col-span-1 p-4 flex flex-col justify-between bg-zinc-900/60 border-zinc-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Chat Sessions</h3>
            </div>
            <Button variant="outline" size="sm" onClick={createNewSession} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New
            </Button>
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  s.id === activeSessionId
                    ? 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
                    : 'bg-zinc-950/40 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  <p className="truncate font-semibold">{s.title}</p>
                  <span className="text-[10px] text-zinc-500">{new Date(s.updatedAt).toLocaleTimeString()}</span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
          <p className="text-[11px] font-mono text-zinc-400">Export Session Transcript:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => exportChatHistory('markdown')} className="text-xs">
              <Download className="w-3 h-3 mr-1" /> .MD
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportChatHistory('json')} className="text-xs">
              <Download className="w-3 h-3 mr-1" /> .JSON
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Chat Workspace */}
      <Card className="lg:col-span-3 p-4 flex flex-col justify-between bg-zinc-900/60 border-zinc-800">
        {/* Top Filter Bar */}
        <div className="pb-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {promptCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                  activeCategory === cat.label
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <Badge variant="info" className="font-mono text-[11px]">
            Server-Side @google/genai (gemini-3.6-flash)
          </Badge>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {currentSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'gemini' && (
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-xl p-4 text-xs space-y-3 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white font-medium self-end'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-1.5 mb-1 text-[11px] font-mono text-zinc-400">
                  <span className="font-semibold text-sky-300">
                    {msg.sender === 'user' ? 'You' : 'Gemini AI Copilot'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    {msg.sender === 'gemini' && (
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Formatted Text Content */}
                <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {msg.text}
                </div>

                {/* Render Embedded AI Generated Chart */}
                {msg.generatedChart && (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2 mt-3">
                    <div className="text-xs font-mono font-semibold text-sky-300 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" />
                      <span>{msg.generatedChart.title}</span>
                    </div>

                    <div className="h-44 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        {msg.generatedChart.type === 'bar' ? (
                          <ReBarChart data={msg.generatedChart.data}>
                            <XAxis
                              dataKey={msg.generatedChart.xAxisKey || 'category'}
                              stroke="#71717a"
                              fontSize={10}
                            />
                            <YAxis stroke="#71717a" fontSize={10} />
                            <Tooltip
                              contentStyle={{
                                background: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '6px',
                                fontSize: '11px',
                              }}
                            />
                            <Bar dataKey={msg.generatedChart.dataKeys?.[0] || 'volume'} fill="#38bdf8" radius={[4, 4, 0, 0]} />
                          </ReBarChart>
                        ) : msg.generatedChart.type === 'pie' ? (
                          <RePieChart>
                            <Pie
                              data={msg.generatedChart.data}
                              dataKey="value"
                              nameKey={msg.generatedChart.xAxisKey || 'name'}
                              cx="50%"
                              cy="50%"
                              outerRadius={65}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {msg.generatedChart.data.map((_, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '6px',
                                fontSize: '11px',
                              }}
                            />
                          </RePieChart>
                        ) : msg.generatedChart.type === 'kpi' ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                            {msg.generatedChart.data.map((kpi: any, idx: number) => (
                              <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-center">
                                <span className="text-[10px] text-zinc-400 font-mono block">{kpi.metric}</span>
                                <span className="text-sm font-bold text-sky-400 font-mono">{kpi.value}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ReLineChart data={msg.generatedChart.data}>
                            <XAxis
                              dataKey={msg.generatedChart.xAxisKey || 'day'}
                              stroke="#71717a"
                              fontSize={10}
                            />
                            <YAxis stroke="#71717a" fontSize={10} />
                            <Tooltip
                              contentStyle={{
                                background: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '6px',
                                fontSize: '11px',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey={msg.generatedChart.dataKeys?.[0] || 'volume'}
                              stroke="#38bdf8"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          </ReLineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Chips */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-400">Suggested Follow-ups:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {msg.suggestedFollowups.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(f)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 rounded text-[10px] font-mono text-sky-300 hover:text-white transition-colors"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 font-mono flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Querying Gemini 3.6 & querying Stellar Horizon / Soroban RPC nodes...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Suggested Prompt Bar & Input */}
        <div className="pt-3 border-t border-zinc-800 space-y-2.5">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 rounded-md text-[11px] font-mono text-zinc-300 hover:text-sky-300 whitespace-nowrap transition-colors shrink-0"
              >
                {p.text}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Gemini plain-English questions about Stellar, Wallets, Assets, DEX, or Soroban..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-sky-500"
            />
            <Button variant="primary" size="md" isLoading={isLoading} onClick={() => handleSend()}>
              <Send className="w-4 h-4 mr-1.5" /> Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
