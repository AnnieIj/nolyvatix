import React from 'react';
import {
  Users,
  Award,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface WalletAnalyticsDashboardProps {
  analytics: any;
}

export const WalletAnalyticsDashboard: React.FC<WalletAnalyticsDashboardProps> = ({ analytics }) => {
  if (!analytics) return null;

  const { summary, transactionStats, topCounterparties, balanceHistory } = analytics;

  const formatNumber = (num: number) =>
    num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Analytics & Intelligence Dashboard</h2>
          <p className="text-xs text-zinc-400">Behavioral metrics, counterparties, and payment destination breakdown.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Counterparties / Payment Destinations */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" /> Top Counterparties
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">
              {topCounterparties?.length || 0} Frequent
            </span>
          </div>

          <div className="space-y-2.5">
            {!topCounterparties || topCounterparties.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                No recent counterparties recorded.
              </div>
            ) : (
              topCounterparties.map((cp: any, idx: number) => (
                <div
                  key={cp.address + idx}
                  className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800">
                      {cp.direction === 'incoming' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <a
                        href={`https://stellar.expert/explorer/public/account/${cp.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-sky-400 font-bold tracking-tight transition-colors"
                      >
                        {cp.address.slice(0, 8)}...{cp.address.slice(-6)}
                      </a>
                      <div className="text-[10px] text-zinc-500">{cp.count} Transactions</div>
                    </div>
                  </div>

                  <div className="text-right font-bold text-sky-400">
                    {formatNumber(cp.volumeXLM)} XLM
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transaction Frequency / Activity Volume Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl lg:col-span-2">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Activity Frequency Timeline
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">
              Active Days: <strong className="text-emerald-400">{summary?.activeDaysCount || 1}</strong>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: number) => [`${val} XLM`, 'Est. Balance Point']}
                />
                <Bar dataKey="balance" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
