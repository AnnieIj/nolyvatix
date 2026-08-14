import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Coins, TrendingUp, ShieldCheck, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';

interface BalanceAnalyticsSectionProps {
  analytics: any;
}

const COLORS = ['#0284c7', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export const BalanceAnalyticsSection: React.FC<BalanceAnalyticsSectionProps> = ({ analytics }) => {
  if (!analytics) return null;

  const { balances, trustlines = [], balanceHistory: rawHistory = [] } = analytics;

  const assetAllocations = useMemo(() => {
    return balances?.assetAllocations || [];
  }, [balances?.assetAllocations]);

  const balanceHistory = useMemo(() => {
    return rawHistory || [];
  }, [rawHistory]);

  const formatNumber = (num: number) =>
    num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Balance & Asset Analytics</h2>
            <p className="text-xs text-zinc-400">
              Detailed asset holdings, trustlines, valuation split, and historical balance trends.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout for Charts & Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Asset Allocation Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-sky-400" /> Asset Distribution
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">
              {assetAllocations.length} Assets
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <PieChart>
                <Pie
                  data={assetAllocations}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="balance"
                  nameKey="code"
                >
                  {assetAllocations.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: number, name: string) => [`${formatNumber(val)}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Asset legend items */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {assetAllocations.map((asset: any, idx: number) => (
              <div
                key={asset.code + idx}
                className="flex items-center justify-between text-xs font-mono p-1.5 rounded hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-white font-medium">{asset.code}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-300">{formatNumber(asset.balance)}</span>
                  <span className="text-[10px] text-zinc-500 ml-1.5">({asset.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Historical Balance Trend Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> XLM Balance History Trend
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live Horizon Stream
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <AreaChart data={balanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: number) => [`${formatNumber(val)} XLM`, 'Estimated Balance']}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trustlines & Holdings Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" /> Active Trustlines & Issued Holdings
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            Total Trustlines: <strong className="text-white">{trustlines.length}</strong>
          </span>
        </div>

        {trustlines.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs">
            No non-native trustlines opened on this account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Asset Code</th>
                  <th className="py-2.5 px-3">Issuer Address</th>
                  <th className="py-2.5 px-3">Current Balance</th>
                  <th className="py-2.5 px-3">Limit</th>
                  <th className="py-2.5 px-3">Auth Status</th>
                  <th className="py-2.5 px-3 text-right">Clawback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {trustlines.map((t: any, idx: number) => (
                  <tr key={t.assetCode + idx} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      {t.assetCode}
                    </td>
                    <td className="py-3 px-3 text-zinc-400 text-[11px]">
                      <a
                        href={`https://stellar.expert/explorer/public/account/${t.assetIssuer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-sky-400 transition-colors flex items-center gap-1"
                      >
                        {t.assetIssuer.slice(0, 8)}...{t.assetIssuer.slice(-6)}
                        <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                      </a>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-400">{formatNumber(t.balance)}</td>
                    <td className="py-3 px-3 text-zinc-400">{t.limit === '922337203685.4775807' ? 'Unlimited' : t.limit}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Authorized
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {t.isClawbackEnabled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Enabled
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Disabled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
