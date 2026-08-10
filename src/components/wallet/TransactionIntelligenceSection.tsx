import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  BarChart2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

interface TransactionIntelligenceSectionProps {
  analytics: any;
}

export const TransactionIntelligenceSection: React.FC<TransactionIntelligenceSectionProps> = ({ analytics }) => {
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing'>('all');

  if (!analytics) return null;

  const { transactionStats, operationsBreakdown, activityTimeline, summary } = analytics;

  const formatNumber = (num: number) =>
    num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const filteredTimeline = (activityTimeline || []).filter((item: any) => {
    if (filterType === 'incoming') {
      return item.details?.to === summary?.accountId;
    }
    if (filterType === 'outgoing') {
      return item.details?.from === summary?.accountId || item.sourceAccount === summary?.accountId;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Transaction & Payment Intelligence</h2>
            <p className="text-xs text-zinc-400">
              Flow analysis, incoming vs outgoing breakdown, and operation category classification.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Incoming Payments */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Incoming Payments</span>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              +{formatNumber(transactionStats?.incomingVolumeXLM || 0)}{' '}
              <span className="text-xs font-normal text-zinc-400">XLM</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">
              Count: <strong className="text-white">{transactionStats?.incomingPaymentsCount || 0}</strong>
            </div>
          </div>
        </div>

        {/* Outgoing Payments */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Outgoing Payments</span>
            <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              -{formatNumber(transactionStats?.outgoingVolumeXLM || 0)}{' '}
              <span className="text-xs font-normal text-zinc-400">XLM</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">
              Count: <strong className="text-white">{transactionStats?.outgoingPaymentsCount || 0}</strong>
            </div>
          </div>
        </div>

        {/* Average Transaction Size */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Transaction Size</span>
            <div className="p-1.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-400 font-mono">
              {formatNumber(transactionStats?.averageTransactionSizeXLM || 0)}{' '}
              <span className="text-xs font-normal text-zinc-400">XLM</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-1">
              Largest: <strong className="text-white">{formatNumber(transactionStats?.largestPaymentXLM || 0)} XLM</strong>
            </div>
          </div>
        </div>

        {/* Asset Diversity Score */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium uppercase tracking-wider">Asset Diversity Score</span>
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">
              {transactionStats?.assetDiversityScore || 0}{' '}
              <span className="text-xs font-normal text-zinc-500">/ 100</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${transactionStats?.assetDiversityScore || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operations Breakdown Chart & Recent Activity List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Breakdown Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Operations Classification
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationsBreakdown || []} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" stroke="#71717a" fontSize={11} />
                <YAxis dataKey="type" type="category" stroke="#a1a1aa" fontSize={10} width={90} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: number) => [`${val} Operations`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {(operationsBreakdown || []).map((_, index: number) => (
                    <Cell key={`bar-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions & Activity Stream */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" /> Account Activity Log
            </h3>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({activityTimeline?.length || 0})
              </button>
              <button
                onClick={() => setFilterType('incoming')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                  filterType === 'incoming' ? 'bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Incoming
              </button>
              <button
                onClick={() => setFilterType('outgoing')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                  filterType === 'outgoing' ? 'bg-rose-950 text-rose-400 font-semibold border border-rose-800' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Outgoing
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredTimeline.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                No transactions match the selected filter.
              </div>
            ) : (
              filteredTimeline.map((item: any) => {
                const isIncoming = item.details?.to === summary?.accountId;
                const isOutgoing = item.details?.from === summary?.accountId || item.sourceAccount === summary?.accountId;
                const amtStr = item.details?.amount || item.details?.startingBalance || '';

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-950/80 hover:bg-zinc-800/60 border border-zinc-800/80 rounded-lg flex items-center justify-between text-xs font-mono transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        {isIncoming ? (
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        ) : isOutgoing ? (
                          <ArrowUpRight className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase">{item.type.replace('_', ' ')}</span>
                          {item.successful ? (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                              <XCircle className="w-3 h-3" /> FAIL
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>
                            {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <a
                            href={`https://stellar.expert/explorer/public/tx/${item.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-sky-400 flex items-center gap-0.5"
                          >
                            Hash: {item.transactionHash?.slice(0, 8)}...
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {amtStr && (
                      <div className="text-right">
                        <div className={`font-bold ${isIncoming ? 'text-emerald-400' : isOutgoing ? 'text-rose-400' : 'text-zinc-300'}`}>
                          {isIncoming ? '+' : isOutgoing ? '-' : ''}
                          {formatNumber(parseFloat(amtStr))} XLM
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
