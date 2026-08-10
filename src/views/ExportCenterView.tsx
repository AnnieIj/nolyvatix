import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Download,
  FileCode,
  FileSpreadsheet,
  FileJson,
  Image,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const ExportCenterView: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'json' | 'markdown' | 'png' | 'svg'>('pdf');
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);

  const handleTriggerExport = (type: string) => {
    setExportedNotice(`Successfully generated ${type.toUpperCase()} package export!`);
    setTimeout(() => setExportedNotice(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-5 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Download className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Unified Export Center</h1>
          <Badge variant="success">Multi-Format Pipeline</Badge>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Export charts, telemetry tables, BI dashboards, and AI executive reports into high-resolution PDF, CSV, JSON, Markdown, PNG, and SVG.
        </p>
      </div>

      {exportedNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg font-mono text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportedNotice}</span>
        </div>
      )}

      {/* Export Format Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {[
          { id: 'pdf', title: 'PDF Report', icon: <Download className="w-4 h-4 text-sky-400" /> },
          { id: 'csv', title: 'CSV Dataset', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> },
          { id: 'json', title: 'JSON Raw Data', icon: <FileJson className="w-4 h-4 text-amber-400" /> },
          { id: 'markdown', title: 'Markdown Doc', icon: <FileCode className="w-4 h-4 text-indigo-400" /> },
          { id: 'png', title: 'PNG Canvas Image', icon: <Image className="w-4 h-4 text-rose-400" /> },
          { id: 'svg', title: 'SVG Vector Chart', icon: <Layers className="w-4 h-4 text-purple-400" /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedFormat(item.id as any)}
            className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
              selectedFormat === item.id
                ? 'bg-sky-500/10 border-sky-500 text-white font-bold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="p-2 bg-zinc-950 rounded-lg">{item.icon}</div>
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Available Data Export Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <GlassCard className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Stellar Network Telemetry Dataset</span>
          </h2>
          <p className="text-zinc-400 text-xs font-sans">
            Export ledger sequences, TPS throughput trends, fee pool metrics, and active wallet distributions over the last 30 days.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleTriggerExport('network-telemetry')}
          >
            Export Dataset ({selectedFormat.toUpperCase()})
          </Button>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Soroban WASM Contract Invocations</span>
          </h2>
          <p className="text-zinc-400 text-xs font-sans">
            Export contract execution telemetry, CPU gas consumption, memory allocations, and WASM failure diagnostics.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleTriggerExport('soroban-wasm')}
          >
            Export WASM Telemetry ({selectedFormat.toUpperCase()})
          </Button>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Anchor Asset Corridors & Liquidity Pools</span>
          </h2>
          <p className="text-zinc-400 text-xs font-sans">
            Export USDC / EURC corridor settlement volumes, AMM liquidity pool reserve ratios, and APY returns.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleTriggerExport('anchor-pools')}
          >
            Export Liquidity Dataset ({selectedFormat.toUpperCase()})
          </Button>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Gemini AI Copilot Analytics Digest</span>
          </h2>
          <p className="text-zinc-400 text-xs font-sans">
            Export AI synthesized executive summaries, anomaly detection logs, and ecosystem recommendations.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleTriggerExport('gemini-digest')}
          >
            Export AI Digest ({selectedFormat.toUpperCase()})
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};
