import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { ArrowUpDown, RefreshCw, Activity, Layers, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { StellarOrderBook, StellarTrade, TradeAggregation } from '../../server/types/stellar';

interface DexIntelligenceSectionProps {
  orderBook?: StellarOrderBook;
  trades?: StellarTrade[];
  tradeAggregations?: TradeAggregation[];
  isLoading: boolean;
  onPairChange?: (base: string, counter: string) => void;
}

export const PRESET_TRADING_PAIRS = [
  { label: 'XLM / USDC', baseCode: 'XLM', baseIssuer: undefined, counterCode: 'USDC', counterIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
  { label: 'XLM / EURC', baseCode: 'XLM', baseIssuer: undefined, counterCode: 'EURC', counterIssuer: 'GDHU6WR2A23C2L6GOHP23K42P324P23A23P23A' },
  { label: 'XLM / AQUA', baseCode: 'XLM', baseIssuer: undefined, counterCode: 'AQUA', counterIssuer: 'GBRAR27X7P4AECY2D4P4B62WFRGHKOHQ4K3PCVVT42FFB3A36DNTAQUA' },
  { label: 'USDC / EURC', baseCode: 'USDC', baseIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', counterCode: 'EURC', counterIssuer: 'GDHU6WR2A23C2L6GOHP23K42P324P23A23P23A' },
];

export const DexIntelligenceSection: React.FC<DexIntelligenceSectionProps> = ({
  orderBook,
  trades = [],
  tradeAggregations = [],
  isLoading,
  onPairChange,
}) => {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);

  const activePair = PRESET_TRADING_PAIRS[selectedPairIndex];

  const handlePairClick = (index: number) => {
    setSelectedPairIndex(index);
    const p = PRESET_TRADING_PAIRS[index];
    if (onPairChange) {
      onPairChange(p.baseCode, p.counterCode);
    }
  };

  // Build depth chart dataset from orderBook bids and asks
  const bids = orderBook?.bids || [];
  const asks = orderBook?.asks || [];

  const depthData = [
    ...bids.slice(0, 15).map((b) => ({
      price: parseFloat(b.price),
      bidDepth: b.depthCumulative || parseFloat(b.amount),
      askDepth: 0,
    })).reverse(),
    ...asks.slice(0, 15).map((a) => ({
      price: parseFloat(a.price),
      bidDepth: 0,
      askDepth: a.depthCumulative || parseFloat(a.amount),
    })),
  ];

  const spread = orderBook?.spread || 0;
  const spreadPct = orderBook?.spreadPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Pair Selector & DEX Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              DEX Order Book & Liquidity Engine
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                {activePair.label}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Live order book depth, market spread, and trade execution feed from Stellar DEX</p>
          </div>
        </div>

        {/* Pair Switching Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {PRESET_TRADING_PAIRS.map((pair, idx) => (
            <button
              key={pair.label}
              onClick={() => handlePairClick(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap border ${
                selectedPairIndex === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Price & Spread Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Top Bid Price</span>
          <h3 className="text-lg font-bold text-emerald-400 font-mono mt-1">
            {bids.length > 0 ? parseFloat(bids[0].price).toFixed(6) : '0.000000'} {activePair.counterCode}
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Amount: {bids[0]?.amount || '0'}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Top Ask Price</span>
          <h3 className="text-lg font-bold text-rose-400 font-mono mt-1">
            {asks.length > 0 ? parseFloat(asks[0].price).toFixed(6) : '0.000000'} {activePair.counterCode}
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Amount: {asks[0]?.amount || '0'}</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Bid / Ask Spread</span>
          <h3 className="text-lg font-bold text-amber-400 font-mono mt-1">
            {spread.toFixed(6)} {activePair.counterCode}
          </h3>
          <span className="text-[11px] text-amber-400/80 font-semibold">
            {spreadPct.toFixed(3)}% Slippage Spread
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">24h Recent Trades Count</span>
          <h3 className="text-lg font-bold text-cyan-400 font-mono mt-1">
            {trades.length} Trades Fetched
          </h3>
          <span className="text-[11px] text-slate-400">Mainnet DEX Execution</span>
        </div>
      </div>

      {/* Main DEX Engine Grid: Order Book + Market Depth + Trade Aggregations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Book Table (Bids & Asks) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Order Book Depth ({activePair.label})
            </h3>
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            {/* Bids Column */}
            <div>
              <div className="flex justify-between font-semibold text-slate-400 border-b border-slate-800 pb-1 mb-2 text-[11px]">
                <span>Bid Price</span>
                <span>Amount ({activePair.baseCode})</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {bids.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No buy orders</p>
                ) : (
                  bids.slice(0, 10).map((b, idx) => (
                    <div key={idx} className="flex justify-between py-1 px-1.5 rounded bg-emerald-950/20 border border-emerald-500/10 text-emerald-400">
                      <span>{parseFloat(b.price).toFixed(6)}</span>
                      <span className="text-slate-300">{parseFloat(b.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Asks Column */}
            <div>
              <div className="flex justify-between font-semibold text-slate-400 border-b border-slate-800 pb-1 mb-2 text-[11px]">
                <span>Ask Price</span>
                <span>Amount ({activePair.baseCode})</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {asks.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No sell orders</p>
                ) : (
                  asks.slice(0, 10).map((a, idx) => (
                    <div key={idx} className="flex justify-between py-1 px-1.5 rounded bg-rose-950/20 border border-rose-500/10 text-rose-400">
                      <span>{parseFloat(a.price).toFixed(6)}</span>
                      <span className="text-slate-300">{parseFloat(a.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Market Depth Chart */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Cumulative Depth Curve (Bids vs Asks)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Visual representation of liquidity depth around top price</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depthData}>
                <XAxis dataKey="price" stroke="#64748b" fontSize={10} tickFormatter={(v) => v.toFixed(4)} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(val: number) => [val.toLocaleString(), 'Cumulative Depth']}
                />
                <Area type="step" dataKey="bidDepth" name="Bids Depth" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                <Area type="step" dataKey="askDepth" name="Asks Depth" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Price Movement Candle Chart & Recent Trades Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Price Movement (OHLCV Aggregations) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Historical Price Movement & Volume
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Daily closing price and trade volume trends on Stellar Horizon</p>
          </div>

          <div className="h-64 w-full">
            {tradeAggregations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No historical trade aggregation records available for this pair.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tradeAggregations}>
                  <XAxis dataKey="dateStr" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(4)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: number) => [val.toFixed(6), 'Price']}
                  />
                  <Line type="monotone" dataKey="close" name="Close Price" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Trades Table */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Live Executed Trades Feed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time DEX fills on Stellar mainnet</p>
          </div>

          <div className="overflow-y-auto max-h-64 space-y-2 pr-1 font-mono text-xs">
            {trades.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No recent trades found for pair</p>
            ) : (
              trades.map((t) => {
                const dateStr = new Date(t.ledgerCloseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return (
                  <div key={t.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-200 font-bold block">{t.baseAmount} {t.baseAssetCode}</span>
                      <span className="text-[10px] text-slate-500">{dateStr}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-cyan-400 font-bold block">@{t.price}</span>
                      <span className="text-[10px] text-slate-400">{t.counterAmount} {t.counterAssetCode}</span>
                    </div>
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
