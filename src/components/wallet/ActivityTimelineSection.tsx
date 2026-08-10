import React, { useState } from 'react';
import {
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CreditCard,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';

interface ActivityTimelineSectionProps {
  analytics: any;
}

export const ActivityTimelineSection: React.FC<ActivityTimelineSectionProps> = ({ analytics }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'payment' | 'trust' | 'contract'>('all');
  const [expandedOpId, setExpandedOpId] = useState<string | null>(null);

  if (!analytics) return null;

  const { activityTimeline } = analytics;

  const filteredTimeline = (activityTimeline || []).filter((item: any) => {
    if (activeTab === 'payment') {
      return ['payment', 'create_account', 'path_payment_strict_send', 'path_payment_strict_receive'].includes(item.type);
    }
    if (activeTab === 'trust') {
      return item.type === 'change_trust' || item.type === 'allow_trust';
    }
    if (activeTab === 'contract') {
      return item.type === 'invoke_host_function';
    }
    return true;
  });

  const getOpBadgeIcon = (type: string) => {
    if (type.includes('payment') || type === 'create_account') return <CreditCard className="w-3.5 h-3.5 text-emerald-400" />;
    if (type.includes('trust')) return <RefreshCw className="w-3.5 h-3.5 text-sky-400" />;
    if (type.includes('host_function') || type.includes('contract')) return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
    return <Layers className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Interactive Activity Timeline</h2>
            <p className="text-xs text-zinc-400">Chronological ledger activity & Soroban contract invocations.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'all' ? 'bg-sky-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Ops
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'payment' ? 'bg-sky-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('trust')}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'trust' ? 'bg-sky-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Trustlines
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
              activeTab === 'contract' ? 'bg-sky-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Soroban WASM
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-zinc-800">
        {filteredTimeline.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-mono border border-dashed border-zinc-800 rounded-lg">
            No activity found for tab "{activeTab}".
          </div>
        ) : (
          filteredTimeline.map((item: any, idx: number) => {
            const isExpanded = expandedOpId === item.id;
            return (
              <div key={item.id || idx} className="relative pl-12 group">
                {/* Timeline Icon Marker */}
                <div className="absolute left-3.5 top-3 -translate-x-1/2 p-1.5 rounded-full bg-zinc-900 border border-zinc-700 shadow-md group-hover:border-sky-500 transition-colors z-10">
                  {getOpBadgeIcon(item.type)}
                </div>

                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase">{item.type.replace('_', ' ')}</span>
                      {item.successful ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> SUCCESS
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> FAILED
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-500 text-[11px]">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span>Source:</span>
                      <a
                        href={`https://stellar.expert/explorer/public/account/${item.sourceAccount}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-0.5"
                      >
                        {item.sourceAccount?.slice(0, 8)}...{item.sourceAccount?.slice(-6)}
                      </a>
                    </div>

                    <button
                      onClick={() => setExpandedOpId(isExpanded ? null : item.id)}
                      className="px-2 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? 'Hide Payload' : 'Inspect Raw'}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expanded Payload Inspector */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto space-y-2">
                      <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1">
                        <span>Transaction Hash</span>
                        <a
                          href={`https://stellar.expert/explorer/public/tx/${item.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:underline flex items-center gap-1"
                        >
                          {item.transactionHash}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <pre className="text-emerald-400 text-[10px] leading-relaxed">
                        {JSON.stringify(item.details || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
