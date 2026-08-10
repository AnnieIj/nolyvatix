import React, { useState, useEffect } from 'react';
import { geminiService, AIExecutiveSummaryReport } from '../../services/api/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Coins,
  ShieldAlert,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const ExecutiveSummarySection: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [report, setReport] = useState<AIExecutiveSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadReport = async (p: 'daily' | 'weekly' | 'monthly') => {
    setIsLoading(true);
    try {
      const data = await geminiService.fetchExecutiveSummary(p);
      setReport(data);
    } catch (e) {
      console.error('Failed to load report:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport(period);
  }, [period]);

  const copyMarkdown = () => {
    if (!report) return;
    let md = `# ${report.title}\nGenerated: ${new Date(report.generatedAt).toLocaleString()}\n\n`;
    md += `## Executive Digest\n${report.executiveSummaryText}\n\n`;
    md += `## Network Health\n- TPS: ${report.networkHealth.tps}\n- Ledger Sequence: ${report.networkHealth.ledgerSequence}\n- Latency: ${report.networkHealth.avgCloseTime}s\n\n`;
    md += `## Key Highlights\n` + report.keyHighlights.map((h) => `- ${h}`).join('\n') + '\n\n';
    md += `## Soroban Insights\n` + report.sorobanInsights.map((s) => `- ${s}`).join('\n') + '\n\n';
    md += `## AI Recommendations\n` + report.aiRecommendations.map((r) => `- ${r}`).join('\n') + '\n';

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = (format: 'markdown' | 'json') => {
    if (!report) return;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stellar-executive-summary-${period}.json`;
      a.click();
    } else {
      let md = `# ${report.title}\nGenerated: ${new Date(report.generatedAt).toLocaleString()}\n\n`;
      md += `## Executive Digest\n${report.executiveSummaryText}\n\n`;
      md += `## Network Health\n- TPS: ${report.networkHealth.tps}\n- Ledger Sequence: ${report.networkHealth.ledgerSequence}\n- Latency: ${report.networkHealth.avgCloseTime}s\n\n`;
      md += `## Key Highlights\n` + report.keyHighlights.map((h) => `- ${h}`).join('\n') + '\n\n';
      md += `## Soroban Insights\n` + report.sorobanInsights.map((s) => `- ${s}`).join('\n') + '\n\n';
      md += `## AI Recommendations\n` + report.aiRecommendations.map((r) => `- ${r}`).join('\n');

      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stellar-executive-summary-${period}.md`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Control Bar */}
      <Card className="p-4 bg-zinc-900/60 border-zinc-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AI Executive Digest Engine
              <Badge variant="info">Gemini 3.6 Flash</Badge>
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Automated multi-dimensional summary reports for Stellar Mainnet & Soroban
            </p>
          </div>
        </div>

        {/* Time Horizon Selector & Export */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-zinc-950 p-1 rounded-lg border border-zinc-800 flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                period === 'daily' ? 'bg-sky-500 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              24h Daily
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                period === 'weekly' ? 'bg-sky-500 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              7-Day Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                period === 'monthly' ? 'bg-sky-500 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              30-Day Monthly
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={copyMarkdown} className="text-xs font-mono">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            Copy Markdown
          </Button>

          <Button variant="outline" size="sm" onClick={() => downloadReport('markdown')} className="text-xs font-mono">
            <Download className="w-3.5 h-3.5 mr-1" /> .MD
          </Button>

          <Button variant="outline" size="sm" onClick={() => downloadReport('json')} className="text-xs font-mono">
            <Download className="w-3.5 h-3.5 mr-1" /> .JSON
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-12 text-center bg-zinc-900/60 border-zinc-800 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-sm font-mono text-zinc-300">Generating AI Executive Report using Stellar Data Engine...</p>
        </Card>
      ) : report ? (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {report.metrics.map((m, idx) => (
              <Card key={idx} className="p-3 bg-zinc-900/80 border-zinc-800">
                <span className="text-[11px] text-zinc-400 font-mono block truncate">{m.label}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-white font-mono">{m.value}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">{m.change}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Report Body Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Summary & Highlights */}
            <div className="lg:col-span-2 space-y-6">
              {/* Executive Overview */}
              <Card className="p-5 bg-zinc-900/80 border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Executive AI Synthesis</span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">{report.executiveSummaryText}</p>
              </Card>

              {/* Key Highlights */}
              <Card className="p-5 bg-zinc-900/80 border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Key Stellar Ecosystem Milestones
                </h3>
                <ul className="space-y-2">
                  {report.keyHighlights.map((h, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Soroban Smart Contract Insights */}
              <Card className="p-5 bg-zinc-900/80 border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" /> Soroban WASM Execution & APM Observations
                </h3>
                <ul className="space-y-2">
                  {report.sorobanInsights.map((s, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Right Column: Asset Trends, Recommendations & Risk Alerts */}
            <div className="space-y-6">
              {/* Asset & Corridor Trends */}
              <Card className="p-5 bg-zinc-900/80 border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" /> Asset & Trustline Velocity
                </h3>
                <ul className="space-y-2">
                  {report.assetTrends.map((t, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* AI Strategic Recommendations */}
              <Card className="p-5 bg-zinc-900/80 border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" /> Strategic AI Action Recommendations
                </h3>
                <ul className="space-y-2">
                  {report.aiRecommendations.map((r, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Risk Alerts */}
              <Card className="p-5 bg-zinc-900/80 border-zinc-800 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Security & Risk Audit Notes
                </h3>
                <ul className="space-y-2">
                  {report.riskAlerts.map((ra, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                      <span>{ra}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
