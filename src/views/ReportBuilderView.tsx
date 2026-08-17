import React, { useState, useEffect } from 'react';
import { BIReport } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { authFetch } from '../lib/apiClient';
import {
  FileText,
  Download,
  Sparkles,
  Calendar,
  CheckSquare,
  Square,
  RefreshCw,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileCode,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';

export const ReportBuilderView: React.FC = () => {
  const [reports, setReports] = useState<BIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<BIReport | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  const availableSections = [
    'Executive Summary',
    'Network Health',
    'Wallet Analytics',
    'Asset Analytics',
    'DEX Analytics',
    'Liquidity Pools',
    'Soroban Analytics',
    'AI Recommendations',
  ];

  const [selectedSections, setSelectedSections] = useState<string[]>(availableSections);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await authFetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
        if (json.data && json.data.length > 0) {
          setSelectedReport(json.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const toggleSection = (section: string) => {
    if (selectedSections.includes(section)) {
      setSelectedSections(selectedSections.filter((s) => s !== section));
    } else {
      setSelectedSections([...selectedSections, section]);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const res = await authFetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          startDate: period === 'custom' ? startDate : undefined,
          endDate: period === 'custom' ? endDate : undefined,
          sections: selectedSections,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        await fetchReports();
        if (json.data) {
          setSelectedReport(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (reportId: string, format: 'pdf' | 'csv' | 'json' | 'markdown') => {
    try {
      const res = await authFetch(`/api/reports/${reportId}/export?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stellar-bi-report-${reportId}.${format === 'markdown' ? 'md' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Report Builder</h1>
            <Badge variant="info">PDF / CSV / JSON / MD</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Synthesize comprehensive daily, weekly, monthly, and custom date range executive BI reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls & Sections Selector */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="p-5 space-y-5 border-sky-500/20">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Report Parameters</span>
            </h2>

            {/* Time Period Selector */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-zinc-400">Reporting Period</label>
              <div className="grid grid-cols-2 gap-2">
                {(['daily', 'weekly', 'monthly', 'custom'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`p-2 rounded border text-center capitalize transition-all ${
                      period === p
                        ? 'bg-sky-500/20 border-sky-500 text-white font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs */}
            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Included Sections Checkboxes */}
            <div className="space-y-2 font-mono text-xs">
              <label className="text-zinc-400 block">Include Report Modules</label>
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
                {availableSections.map((section) => {
                  const isChecked = selectedSections.includes(section);
                  return (
                    <div
                      key={section}
                      onClick={() => toggleSection(section)}
                      className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-zinc-900 transition-colors text-zinc-300"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-sky-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600" />
                      )}
                      <span>{section}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />}
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full"
            >
              {generating ? 'Synthesizing Report...' : 'Generate Executive Report'}
            </Button>
          </GlassCard>

          {/* Report History List */}
          <GlassCard className="p-4 space-y-3">
            <h3 className="text-xs font-bold text-white font-mono flex items-center justify-between">
              <span>Saved Reports Archive</span>
              <span className="text-zinc-500 font-normal">({reports.length})</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold truncate">{rep.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                      <span className="uppercase">{rep.period}</span>
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Preview & Export View */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <GlassCard className="p-6 space-y-6 border-zinc-800">
              {/* Report Title & Export Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">{selectedReport.title}</h2>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Generated: {new Date(selectedReport.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="glass"
                    size="sm"
                    leftIcon={<FileCode className="w-3.5 h-3.5 text-indigo-400" />}
                    onClick={() => handleExport(selectedReport.id, 'markdown')}
                  >
                    Markdown
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                    onClick={() => handleExport(selectedReport.id, 'csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    leftIcon={<FileJson className="w-3.5 h-3.5 text-amber-400" />}
                    onClick={() => handleExport(selectedReport.id, 'json')}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleExport(selectedReport.id, 'pdf')}
                  >
                    Export PDF
                  </Button>
                </div>
              </div>

              {/* KPIs Summary Cards Grid */}
              {selectedReport.content.kpis && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedReport.content.kpis.map((kpi, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg font-mono">
                      <div className="text-[10px] text-zinc-500 uppercase">{kpi.label}</div>
                      <div className="text-lg font-bold text-white mt-0.5">{kpi.value}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{kpi.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Executive Summary Block */}
              <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Executive AI Summary</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {selectedReport.content.executiveSummaryText}
                </p>
              </div>

              {/* Network Health Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider text-zinc-400">
                  Network Health & Throughput
                </h3>
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-zinc-500 block text-[10px]">Average Throughput</span>
                    <span className="text-white font-bold">{selectedReport.content.networkHealth.tps} TPS</span>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-zinc-500 block text-[10px]">Ledger Sequence</span>
                    <span className="text-white font-bold">#{selectedReport.content.networkHealth.ledgerSequence}</span>
                  </div>
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                    <span className="text-zinc-500 block text-[10px]">Close Latency</span>
                    <span className="text-emerald-400 font-bold">{selectedReport.content.networkHealth.avgCloseTime}s</span>
                  </div>
                </div>
              </div>

              {/* Top Anchor Assets */}
              {selectedReport.content.assetAnalytics?.topAssets && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider text-zinc-400">
                    Top Anchor Asset Volumes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500">
                          <th className="pb-2">Asset Code</th>
                          <th className="pb-2">24h Settlement Volume</th>
                          <th className="pb-2">Active Trustlines</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                        {selectedReport.content.assetAnalytics.topAssets.map((a, idx) => (
                          <tr key={idx}>
                            <td className="py-2 font-bold text-sky-400">{a.code}</td>
                            <td className="py-2">{a.volume24h}</td>
                            <td className="py-2">{a.trustlines.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AI Strategic Recommendations */}
              {selectedReport.content.aiRecommendations && (
                <div className="space-y-2 font-mono text-xs">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">
                    AI Strategic Recommendations
                  </h3>
                  <div className="space-y-2">
                    {selectedReport.content.aiRecommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center text-zinc-500 font-mono text-xs">
              Select a report from the archive or click "Generate Executive Report"
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
