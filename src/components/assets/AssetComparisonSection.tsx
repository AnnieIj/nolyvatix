import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowRightLeft, ShieldCheck, Users, Coins, Layers, Plus, Trash2 } from 'lucide-react';
import { StellarAsset } from '../../server/types/stellar';

interface AssetComparisonSectionProps {
  selectedAssets: StellarAsset[];
  allAssets: StellarAsset[];
  onRemoveAsset: (code: string, issuer: string) => void;
  onAddAsset: (asset: StellarAsset) => void;
}

export const AssetComparisonSection: React.FC<AssetComparisonSectionProps> = ({
  selectedAssets,
  allAssets,
  onRemoveAsset,
  onAddAsset,
}) => {
  const chartData = selectedAssets.map((asset) => ({
    name: asset.assetCode,
    holders: asset.numAccounts || 0,
    liquidityPools: parseFloat(asset.liquidityPoolsAmount || '0') / 1000, // in thousands
    claimableBalances: asset.numClaimableBalances || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Selector & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              Multi-Asset Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Compare up to 4 Stellar assets across holders, supply, liquidity pools, and security flags</p>
          </div>

          {/* Asset Dropdown Selector to add more */}
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                const [code, issuer] = e.target.value.split('|');
                const matched = allAssets.find((a) => a.assetCode === code && a.assetIssuer === issuer);
                if (matched) onAddAsset(matched);
                e.target.value = '';
              }}
              defaultValue=""
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="" disabled>+ Add Asset to Compare...</option>
              {allAssets
                .filter((a) => !selectedAssets.some((s) => s.assetCode === a.assetCode && s.assetIssuer === a.assetIssuer))
                .map((a) => (
                  <option key={`${a.assetCode}-${a.assetIssuer}`} value={`${a.assetCode}|${a.assetIssuer}`}>
                    {a.assetCode} ({a.assetIssuer.slice(0, 8)}...)
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Selected Asset Chips */}
        <div className="flex flex-wrap gap-2">
          {selectedAssets.map((asset) => (
            <div
              key={`${asset.assetCode}-${asset.assetIssuer}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            >
              <span className="font-bold text-cyan-400">{asset.assetCode}</span>
              <button
                onClick={() => onRemoveAsset(asset.assetCode, asset.assetIssuer)}
                className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition"
                title="Remove asset from comparison"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Bar Chart Comparison */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h4 className="font-bold text-slate-100 text-sm">Relative Holders & Liquidity Pool Volume</h4>
        <div className="h-72 w-full">
          {selectedAssets.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select at least 1 asset above to render comparison charts.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="holders" name="Holders Count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="liquidityPools" name="Liquidity Pool Volume (k)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Side-by-Side Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
              <th className="py-3 px-3">Metric</th>
              {selectedAssets.map((asset) => (
                <th key={asset.assetCode} className="py-3 px-3 font-bold text-cyan-400 font-mono text-sm">
                  {asset.assetCode}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
            <tr>
              <td className="py-3 px-3 text-slate-400 font-sans">Asset Type</td>
              {selectedAssets.map((asset) => (
                <td key={asset.assetCode} className="py-3 px-3 font-semibold">
                  {asset.assetType}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-3 text-slate-400 font-sans">Issuer Address</td>
              {selectedAssets.map((asset) => (
                <td key={asset.assetCode} className="py-3 px-3 text-slate-400 text-[11px]">
                  {asset.assetIssuer.slice(0, 10)}...{asset.assetIssuer.slice(-6)}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-3 text-slate-400 font-sans">Registered Holders / Trustlines</td>
              {selectedAssets.map((asset) => (
                <td key={asset.assetCode} className="py-3 px-3 font-bold text-slate-100">
                  {(asset.numAccounts || 0).toLocaleString()}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-3 text-slate-400 font-sans">Circulating Supply</td>
              {selectedAssets.map((asset) => (
                <td key={asset.assetCode} className="py-3 px-3 font-semibold text-emerald-400">
                  {parseFloat(asset.amount || '0').toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-3 text-slate-400 font-sans">Liquidity Pool Amount</td>
              {selectedAssets.map((asset) => (
                <td key={asset.assetCode} className="py-3 px-3 font-semibold text-blue-400">
                  {parseFloat(asset.liquidityPoolsAmount || '0').toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-3 text-slate-400 font-sans">Claimable Balances Count</td>
              {selectedAssets.map((asset) => (
                <td key={asset.assetCode} className="py-3 px-3">
                  {asset.numClaimableBalances}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-3 text-slate-400 font-sans">Security Flags</td>
              {selectedAssets.map((asset) => (
                <td key={asset.assetCode} className="py-3 px-3">
                  <div className="flex flex-col gap-1 text-[10px]">
                    <span className={asset.flags.authRequired ? 'text-amber-400' : 'text-slate-500'}>
                      Auth Required: {String(asset.flags.authRequired)}
                    </span>
                    <span className={asset.flags.authRevocable ? 'text-purple-400' : 'text-slate-500'}>
                      Auth Revocable: {String(asset.flags.authRevocable)}
                    </span>
                    <span className={asset.flags.authClawbackEnabled ? 'text-rose-400' : 'text-slate-500'}>
                      Clawback: {String(asset.flags.authClawbackEnabled)}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
