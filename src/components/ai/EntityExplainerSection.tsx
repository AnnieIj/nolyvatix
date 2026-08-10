import React, { useState } from 'react';
import { geminiService } from '../../services/api/gemini';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Search,
  Wallet,
  Coins,
  ArrowRightLeft,
  FileText,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export const EntityExplainerSection: React.FC = () => {
  const [entityType, setEntityType] = useState<'wallet' | 'asset' | 'dex' | 'soroban'>('wallet');
  const [identifier, setIdentifier] = useState('GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNF2XOMTGV5O56XX254S8');
  const [explanation, setExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = async (overrideId?: string, overrideType?: 'wallet' | 'asset' | 'dex' | 'soroban') => {
    const targetType = overrideType || entityType;
    const targetId = overrideId || identifier;
    if (!targetId.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const data = await geminiService.explainEntity(targetType, targetId);
      setExplanation(data);
    } catch (e) {
      console.error('Failed to explain entity:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const presetExamples = [
    { type: 'wallet' as const, id: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNF2XOMTGV5O56XX254S8', label: 'Circle Anchor Wallet' },
    { type: 'asset' as const, id: 'USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WF2CCXM3LSSA2YACSTB72225', label: 'Circle USDC' },
    { type: 'soroban' as const, id: 'CCW67TSB3S2R34A5MOP4RHTM335WF2CCXM3LSSA2YACSTB72225BLEND', label: 'Blend Pool Contract' },
    { type: 'dex' as const, id: 'XLM-native / USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WF2CCXM3LSSA2YACSTB72225', label: 'XLM / USDC AMM' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Search Card */}
      <Card className="p-4 bg-zinc-900/60 border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Deep Entity AI Explainer Engine</h2>
          </div>
          <Badge variant="info" className="font-mono text-[11px]">
            Wallet / Asset / DEX / Soroban Intelligence
          </Badge>
        </div>

        {/* Entity Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setEntityType('wallet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              entityType === 'wallet' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> Wallet Intelligence
          </button>
          <button
            onClick={() => setEntityType('asset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              entityType === 'asset' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" /> Asset Intelligence
          </button>
          <button
            onClick={() => setEntityType('soroban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              entityType === 'soroban' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Soroban APM Contract
          </button>
          <button
            onClick={() => setEntityType('dex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              entityType === 'dex' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> DEX & Pool Pair
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
            placeholder={
              entityType === 'wallet'
                ? 'Enter Stellar Public Key (G...)...'
                : entityType === 'asset'
                ? 'Enter Asset Code or Asset Canonical String (e.g. USDC...)...'
                : entityType === 'soroban'
                ? 'Enter Soroban Contract ID (C...)...'
                : 'Enter DEX Pair (e.g. XLM/USDC)...'
            }
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-sky-500"
          />
          <Button variant="primary" size="md" isLoading={isLoading} onClick={() => handleExplain()}>
            <Search className="w-4 h-4 mr-1.5" /> Explain
          </Button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <span className="text-[11px] font-mono text-zinc-400 shrink-0">Sample Entities:</span>
          {presetExamples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEntityType(ex.type);
                setIdentifier(ex.id);
                handleExplain(ex.id, ex.type);
              }}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 rounded text-[11px] font-mono text-zinc-300 hover:text-sky-300 whitespace-nowrap transition-colors shrink-0"
            >
              [{ex.type.toUpperCase()}] {ex.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Explanation Results */}
      {isLoading ? (
        <Card className="p-12 text-center bg-zinc-900/60 border-zinc-800 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-sm font-mono text-zinc-300">Fetching entity ledger state and generating Gemini AI diagnosis...</p>
        </Card>
      ) : explanation ? (
        <Card className="p-6 bg-zinc-900/80 border-zinc-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-wrap gap-2">
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase font-semibold">
                [{explanation.type?.toUpperCase()}] AI Intelligence Profile
              </span>
              <h3 className="text-base font-bold text-white font-mono truncate max-w-xl">
                {explanation.accountName || explanation.contractName || explanation.identifier}
              </h3>
            </div>
            {explanation.riskScore && (
              <Badge variant="success" className="font-mono text-xs">
                {explanation.riskScore}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overview & Behavioral Analysis */}
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                <span className="text-xs font-mono font-semibold text-sky-300">AI Diagnostic Overview</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{explanation.overview}</p>
              </div>

              {explanation.behavioralProfile && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400">Behavioral Profile & Features</span>
                  <ul className="space-y-1.5">
                    {explanation.behavioralProfile.map((b: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation.executionProfile && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <span className="text-xs font-mono font-semibold text-purple-400">Execution Profile</span>
                  <ul className="space-y-1.5">
                    {explanation.executionProfile.map((ep: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{ep}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Metrics & Recommendations */}
            <div className="space-y-4">
              {explanation.gasMetrics && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block">CPU Gas</span>
                    <span className="text-xs font-bold text-sky-400 font-mono">{explanation.gasMetrics.avgCpuUnits}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Memory</span>
                    <span className="text-xs font-bold text-purple-400 font-mono">{explanation.gasMetrics.avgMemBytes}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Success Rate</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{explanation.gasMetrics.successRate}</span>
                  </div>
                </div>
              )}

              {explanation.marketStanding && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-zinc-500 font-mono block">Market Standing</span>
                  <p className="text-xs font-bold text-sky-300 font-mono">{explanation.marketStanding}</p>
                  <p className="text-xs text-zinc-400 pt-1">{explanation.liquidityAnalysis}</p>
                </div>
              )}

              {explanation.recommendations && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                  <span className="text-xs font-mono font-semibold text-amber-400">AI Recommendations</span>
                  <ul className="space-y-1.5">
                    {explanation.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center bg-zinc-900/60 border-zinc-800 text-zinc-500">
          <p className="text-sm font-mono">Enter a wallet, asset, Soroban contract, or DEX pair above to trigger deep AI analysis.</p>
        </Card>
      )}
    </div>
  );
};
