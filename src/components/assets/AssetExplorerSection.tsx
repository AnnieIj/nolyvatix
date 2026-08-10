import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, Users, Coins, Layers, ExternalLink, RefreshCw, ChevronRight, BarChart2 } from 'lucide-react';
import { StellarAsset } from '../../server/types/stellar';

interface AssetExplorerSectionProps {
  assets: StellarAsset[];
  isLoading: boolean;
  onSelectAssetForComparison?: (asset: StellarAsset) => void;
  onSelectAssetForDex?: (asset: StellarAsset) => void;
}

export const PRESET_FEATURED_ASSETS = [
  { code: 'XLM', name: 'Stellar Lumens (Native)', issuer: 'Native Ledger Asset', type: 'native', verified: true },
  { code: 'USDC', name: 'Circle USD Coin', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', type: 'credit_alphanum4', verified: true },
  { code: 'EURC', name: 'Circle Euro Coin', issuer: 'GDHU6WR2A23C2L6GOHP23K42P324P23A23P23A', type: 'credit_alphanum4', verified: true },
  { code: 'AQUA', name: 'Aquarius Network', issuer: 'GBRAR27X7P4AECY2D4P4B62WFRGHKOHQ4K3PCVVT42FFB3A36DNTAQUA', type: 'credit_alphanum4', verified: true },
  { code: 'yXLM', name: 'Ultra Stellar Yield XLM', issuer: 'GARDTXCENSPM47T4SXXI4ERL4O2CVMNS4T22CR5GPDNOX64OH24W732B', type: 'credit_alphanum4', verified: true },
];

export const AssetExplorerSection: React.FC<AssetExplorerSectionProps> = ({
  assets,
  isLoading,
  onSelectAssetForComparison,
  onSelectAssetForDex,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<StellarAsset | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return asset.assetCode.toLowerCase().includes(q) || asset.assetIssuer.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Explorer Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Asset Code (e.g., USDC) or Issuer (G...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 whitespace-nowrap font-mono">Presets:</span>
          {PRESET_FEATURED_ASSETS.map((preset) => (
            <button
              key={preset.code}
              onClick={() => setSearchQuery(preset.code)}
              className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-semibold transition whitespace-nowrap flex items-center gap-1"
            >
              <span className="text-cyan-400">#</span>
              {preset.code}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Explorer Grid */}
      {isLoading ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
          <p className="text-sm">Querying Horizon Asset Registry...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-base font-semibold text-slate-200">No assets found matching "{searchQuery}"</p>
          <p className="text-xs text-slate-500 mt-1">Try searching for standard code like USDC or a valid 56-character issuer address.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset, idx) => {
            const totalAccounts = asset.numAccounts || 0;
            const circulatingAmount = parseFloat(asset.amount || '0').toLocaleString(undefined, { maximumFractionDigits: 2 });

            return (
              <div
                key={`${asset.assetCode}-${asset.assetIssuer}-${idx}`}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-cyan-500/5 group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-sm tracking-wide">
                        {asset.assetCode.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-100 text-base group-hover:text-cyan-400 transition">
                            {asset.assetCode}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            {asset.assetType}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500 truncate max-w-[200px]" title={asset.assetIssuer}>
                          {asset.assetIssuer.slice(0, 8)}...{asset.assetIssuer.slice(-6)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAssetDetail(asset)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800/80 transition"
                      title="View Asset Detail & Metadata"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" />
                        Trustlines/Holders
                      </span>
                      <p className="font-mono font-semibold text-slate-200 mt-0.5">
                        {totalAccounts.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Coins className="w-3 h-3 text-blue-400" />
                        Circulating Supply
                      </span>
                      <p className="font-mono font-semibold text-slate-200 mt-0.5 truncate" title={asset.amount}>
                        {circulatingAmount}
                      </p>
                    </div>
                  </div>

                  {/* Security Flags */}
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {asset.flags.authRequired && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Auth Required
                      </span>
                    )}
                    {asset.flags.authRevocable && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Revocable
                      </span>
                    )}
                    {asset.flags.authClawbackEnabled && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Clawback Enabled
                      </span>
                    )}
                    {!asset.flags.authRequired && !asset.flags.authRevocable && !asset.flags.authClawbackEnabled && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> Immutable / Open
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onSelectAssetForDex && onSelectAssetForDex(asset)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg font-medium border border-slate-700/80 transition flex items-center justify-center gap-1.5"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    Trade / DEX Depth
                  </button>

                  <button
                    onClick={() => onSelectAssetForComparison && onSelectAssetForComparison(asset)}
                    className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg font-medium border border-slate-700/80 transition"
                    title="Add to Asset Comparison Matrix"
                  >
                    Compare
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 text-lg">
                  {selectedAssetDetail.assetCode.slice(0, 4)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    {selectedAssetDetail.assetCode}
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {selectedAssetDetail.assetType}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Issuer: {selectedAssetDetail.assetIssuer}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[11px] block">Authorized Accounts</span>
                <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
                  {selectedAssetDetail.accounts.authorized.toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[11px] block">Liquidity Pool Volume</span>
                <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
                  {parseFloat(selectedAssetDetail.liquidityPoolsAmount).toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[11px] block">Active Liquidity Pools</span>
                <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
                  {selectedAssetDetail.numLiquidityPools} Pools
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[11px] block">Claimable Balances</span>
                <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
                  {selectedAssetDetail.numClaimableBalances}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Issuer Account Metadata & Verification</h4>
              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <p>Paging Token: <span className="text-slate-200">{selectedAssetDetail.pagingToken}</span></p>
                <p>Auth Required: <span className={selectedAssetDetail.flags.authRequired ? 'text-amber-400' : 'text-emerald-400'}>{String(selectedAssetDetail.flags.authRequired)}</span></p>
                <p>Auth Revocable: <span className={selectedAssetDetail.flags.authRevocable ? 'text-purple-400' : 'text-slate-300'}>{String(selectedAssetDetail.flags.authRevocable)}</span></p>
                <p>Clawback Enabled: <span className={selectedAssetDetail.flags.authClawbackEnabled ? 'text-rose-400' : 'text-slate-300'}>{String(selectedAssetDetail.flags.authClawbackEnabled)}</span></p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={`https://stellar.expert/explorer/public/asset/${selectedAssetDetail.assetCode}-${selectedAssetDetail.assetIssuer}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                View on StellarExpert <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  if (onSelectAssetForDex) onSelectAssetForDex(selectedAssetDetail);
                  setSelectedAssetDetail(null);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                Inspect DEX Order Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
