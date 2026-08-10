import React, { useState } from 'react';
import { geminiService } from '../../services/api/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  BarChart2,
  LineChart,
  PieChart,
  Send,
  Download,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#fbbf24', '#c084fc'];

export const AiChartGeneratorSection: React.FC = () => {
  const [prompt, setPrompt] = useState('Compare Circle USDC and Circle EURC 30-day payment volume trend');
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  const handleGenerate = async (queryToUse?: string) => {
    const query = queryToUse || prompt;
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await geminiService.generateChart(query);
      setChartData(res.chart);
      setInsights(res.insights || []);
    } catch (e) {
      console.error('Failed to generate chart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Compare Circle USDC and Circle EURC 30-day payment volume trend',
    'Bar chart of Soroban WASM CPU gas consumption by smart contract',
    'Pie chart of DEX AMM liquidity pool TVL distribution',
    'Area chart of Stellar ledger TPS throughput over the last 24 hours',
  ];

  const exportCSV = () => {
    if (!chartData || !chartData.data) return;
    const keys = Object.keys(chartData.data[0] || {});
    let csv = keys.join(',') + '\n';
    chartData.data.forEach((row: any) => {
      csv += keys.map((k) => row[k]).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stellar-ai-chart-data.csv`;
    a.click();
  };

  const exportJSON = () => {
    if (!chartData) return;
    const blob = new Blob([JSON.stringify(chartData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stellar-ai-chart-data.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Input Bar */}
      <Card className="p-4 bg-zinc-900/60 border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Natural Language AI Chart Generator</h2>
          </div>
          <Badge variant="info" className="font-mono text-[11px]">
            Dynamic Recharts Canvas
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Describe any chart you want to visualize (e.g., 'Compare USDC volume', 'Soroban gas usage bar chart')..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-sky-500"
          />
          <Button variant="primary" size="md" isLoading={isLoading} onClick={() => handleGenerate()}>
            <Sparkles className="w-4 h-4 mr-1.5" /> Generate Chart
          </Button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <span className="text-[11px] font-mono text-zinc-400 shrink-0">Try Prompts:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleGenerate(p);
              }}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 rounded text-[11px] font-mono text-zinc-300 hover:text-sky-300 whitespace-nowrap transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      {/* Chart Canvas */}
      <Card className="p-6 bg-zinc-900/80 border-zinc-800 min-h-[460px] flex flex-col justify-between">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-sm font-mono text-zinc-300">Synthesizing chart dataset from Stellar Mainnet API...</p>
          </div>
        ) : chartData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 flex-wrap gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-mono">{chartData.title}</h3>
                <span className="text-xs text-zinc-400 font-mono">
                  Chart Type: {chartData.type?.toUpperCase()} | Generated from Stellar Data Engine
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs font-mono">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportJSON} className="text-xs font-mono">
                  <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
                </Button>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-[360px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartData.type === 'bar' ? (
                  <ReBarChart data={chartData.data}>
                    <XAxis dataKey={chartData.xAxisKey || 'category'} stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '6px' }} />
                    <Legend />
                    {(chartData.dataKeys || ['volume']).map((key: string, idx: number) => (
                      <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                  </ReBarChart>
                ) : chartData.type === 'pie' ? (
                  <RePieChart>
                    <Pie
                      data={chartData.data}
                      dataKey="value"
                      nameKey={chartData.xAxisKey || 'name'}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {chartData.data.map((_: any, idx: number) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '6px' }} />
                  </RePieChart>
                ) : chartData.type === 'area' ? (
                  <ReAreaChart data={chartData.data}>
                    <XAxis dataKey={chartData.xAxisKey || 'time'} stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '6px' }} />
                    <Legend />
                    <Area type="monotone" dataKey={chartData.dataKeys?.[0] || 'volume'} stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                  </ReAreaChart>
                ) : chartData.type === 'kpi' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                    {chartData.data.map((kpi: any, idx: number) => (
                      <div key={idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-center space-y-1">
                        <span className="text-xs text-zinc-400 font-mono block">{kpi.metric}</span>
                        <span className="text-xl font-bold text-sky-400 font-mono">{kpi.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ReLineChart data={chartData.data}>
                    <XAxis dataKey={chartData.xAxisKey || 'time'} stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '6px' }} />
                    <Legend />
                    {(chartData.dataKeys || ['volume']).map((key: string, idx: number) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                    ))}
                  </ReLineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* AI Insights Below Chart */}
            {insights.length > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <span className="text-xs font-mono font-semibold text-sky-400">AI Data Insights:</span>
                <ul className="space-y-1">
                  {insights.map((inText, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 font-sans flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span>{inText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-zinc-500 py-16">
            <BarChart2 className="w-10 h-10 text-zinc-700" />
            <p className="text-sm font-mono">Enter a natural prompt above or click a prompt sample to generate a live chart.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
