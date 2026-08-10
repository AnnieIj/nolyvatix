import React from 'react';
import {
  Wallet,
  Hash,
  Globe,
  Layers,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface WalletSummaryCardsProps {
  analytics: any;
}

export const WalletSummaryCards: React.FC<WalletSummaryCardsProps> = ({ analytics }) => {
  if (!analytics) return null;

  const { summary, balances, account } = analytics;

  const formatNumber = (num: number, decimals = 2) =>
    num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Native XLM Balance */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors" />
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-xs font-medium uppercase tracking-wider">Native XLM Balance</span>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {formatNumber(balances?.nativeXlm || 0)}{' '}
            <span className="text-xs font-normal text-sky-400">XLM</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>Avail: {formatNumber(balances?.nativeAvailable || 0)}</span>
            <span className="text-zinc-500">Res: {formatNumber(balances?.nativeReserved || 0)}</span>
          </div>
        </div>
      </div>

      {/* 2. Sequence & Subentries */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-xs font-medium uppercase tracking-wider">Sequence & Subentries</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Hash className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-white tracking-tight font-mono truncate">
            #{summary?.sequence || 'N/A'}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800 text-[11px] font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" /> Subentries:
            </span>
            <span className="text-white font-semibold">{summary?.subaccountCount || 0}</span>
          </div>
        </div>
      </div>

      {/* 3. Home Domain & Flags */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-xs font-medium uppercase tracking-wider">Domain & Signers</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Globe className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-white tracking-tight font-mono truncate">
            {summary?.homeDomain ? (
              <a
                href={`https://${summary.homeDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                {summary.homeDomain}
              </a>
            ) : (
              <span className="text-zinc-500 italic">No Domain Registered</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800 text-[11px] font-mono">
            <span className="text-zinc-400">Signers Count:</span>
            <span className="text-emerald-400 font-semibold">{account?.signers?.length || 1}</span>
          </div>
        </div>
      </div>

      {/* 4. Transaction Success Rate */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {summary?.successRate || 100}%
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>Total Txs: {summary?.totalTransactions || 0}</span>
            <span className="text-zinc-500">Active Days: {summary?.activeDaysCount || 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
