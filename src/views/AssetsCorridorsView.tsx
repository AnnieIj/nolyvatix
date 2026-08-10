import React, { useState } from 'react';
import { WorkspaceHeader } from '../components/layout/WorkspaceHeader';
import {
  useAssets,
  useOrderBook,
  useTrades,
  useTradeAggregations,
  useLiquidityPools,
} from '../hooks/useAssetData';
import { AssetExplorerSection } from '../components/assets/AssetExplorerSection';
import { AssetAnalyticsSection } from '../components/assets/AssetAnalyticsSection';
import { DexIntelligenceSection } from '../components/assets/DexIntelligenceSection';
import { LiquidityPoolAnalyticsSection } from '../components/assets/LiquidityPoolAnalyticsSection';
import { AssetComparisonSection } from '../components/assets/AssetComparisonSection';
import {
  Coins,
  TrendingUp,
  Activity,
  Layers,
  ArrowRightLeft,
  RefreshCw,
} from 'lucide-react';
import { StellarAsset } from '../server/types/stellar';

export const AssetsCorridorsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'explorer' | 'analytics' | 'dex' | 'pools' | 'comparison'
  >('explorer');

  // Pair state for DEX tab
  const [dexPair, setDexPair] = useState<{
    baseCode: string;
    baseIssuer?: string;
    counterCode: string;
    counterIssuer?: string;
  }>({
    baseCode: 'XLM',
    counterCode: 'USDC',
    counterIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  });

  // Assets Query
  const { data: assetsList = [], isLoading: isLoadingAssets, refetch: refetchAssets } = useAssets({ limit: 50 });

  // DEX Queries
  const { data: orderBook, isLoading: isLoadingOrderBook } = useOrderBook({
    sellingType: dexPair.baseCode === 'XLM' ? 'native' : 'credit_alphanum4',
    sellingCode: dexPair.baseCode === 'XLM' ? undefined : dexPair.baseCode,
    sellingIssuer: dexPair.baseIssuer,
    buyingType: dexPair.counterCode === 'XLM' ? 'native' : 'credit_alphanum4',
    buyingCode: dexPair.counterCode === 'XLM' ? undefined : dexPair.counterCode,
    buyingIssuer: dexPair.counterIssuer,
    limit: 20,
  });

  const { data: trades = [] } = useTrades({
    baseType: dexPair.baseCode === 'XLM' ? 'native' : 'credit_alphanum4',
    baseCode: dexPair.baseCode === 'XLM' ? undefined : dexPair.baseCode,
    baseIssuer: dexPair.baseIssuer,
    counterType: dexPair.counterCode === 'XLM' ? 'native' : 'credit_alphanum4',
    counterCode: dexPair.counterCode === 'XLM' ? undefined : dexPair.counterCode,
    counterIssuer: dexPair.counterIssuer,
    limit: 20,
  });

  const { data: tradeAggregations = [] } = useTradeAggregations({
    baseType: dexPair.baseCode === 'XLM' ? 'native' : 'credit_alphanum4',
    baseCode: dexPair.baseCode === 'XLM' ? undefined : dexPair.baseCode,
    baseIssuer: dexPair.baseIssuer,
    counterType: dexPair.counterCode === 'XLM' ? 'native' : 'credit_alphanum4',
    counterCode: dexPair.counterCode === 'XLM' ? undefined : dexPair.counterCode,
    counterIssuer: dexPair.counterIssuer,
    resolution: 86400000,
    limit: 14,
  });

  // Liquidity Pools Query
  const { data: liquidityPools = [], isLoading: isLoadingPools } = useLiquidityPools(30);

  // Comparison State
  const [comparisonAssets, setComparisonAssets] = useState<StellarAsset[]>([]);

  // Auto initialize comparison assets once assetsList loads
  React.useEffect(() => {
    if (assetsList.length > 0 && comparisonAssets.length === 0) {
      setComparisonAssets(assetsList.slice(0, 3));
    }
  }, [assetsList]);

  const handleSelectAssetForDex = (asset: StellarAsset) => {
    setDexPair({
      baseCode: asset.assetCode,
      baseIssuer: asset.assetIssuer,
      counterCode: 'USDC',
      counterIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    });
    setActiveTab('dex');
  };

  const handleAddComparisonAsset = (asset: StellarAsset) => {
    if (!comparisonAssets.some((a) => a.assetCode === asset.assetCode && a.assetIssuer === asset.assetIssuer)) {
      setComparisonAssets([...comparisonAssets, asset]);
    }
  };

  const handleRemoveComparisonAsset = (code: string, issuer: string) => {
    setComparisonAssets(comparisonAssets.filter((a) => !(a.assetCode === code && a.assetIssuer === issuer)));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <WorkspaceHeader
        title="Asset & DEX Intelligence Module"
        subtitle="Enterprise Asset Registry, Order Book Depth, AMM Liquidity Pools & Multi-Asset Analytics"
      />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max pb-1">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'explorer'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Coins className="w-4 h-4" />
            Asset Explorer
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'analytics'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Asset Analytics
          </button>

          <button
            onClick={() => setActiveTab('dex')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'dex'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Activity className="w-4 h-4" />
            DEX Intelligence
          </button>

          <button
            onClick={() => setActiveTab('pools')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'pools'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Layers className="w-4 h-4" />
            Liquidity Pools
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'comparison'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Asset Comparison Matrix
          </button>
        </div>

        <button
          onClick={() => refetchAssets()}
          className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-medium"
          title="Refresh Horizon Data Engine"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAssets ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'explorer' && (
        <AssetExplorerSection
          assets={assetsList}
          isLoading={isLoadingAssets}
          onSelectAssetForDex={handleSelectAssetForDex}
          onSelectAssetForComparison={handleAddComparisonAsset}
        />
      )}

      {activeTab === 'analytics' && (
        <AssetAnalyticsSection assets={assetsList} />
      )}

      {activeTab === 'dex' && (
        <DexIntelligenceSection
          orderBook={orderBook}
          trades={trades}
          tradeAggregations={tradeAggregations}
          isLoading={isLoadingOrderBook}
          onPairChange={(base, counter) => {
            setDexPair({
              baseCode: base,
              counterCode: counter,
              counterIssuer: counter === 'USDC' ? 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' : undefined,
            });
          }}
        />
      )}

      {activeTab === 'pools' && (
        <LiquidityPoolAnalyticsSection pools={liquidityPools} isLoading={isLoadingPools} />
      )}

      {activeTab === 'comparison' && (
        <AssetComparisonSection
          selectedAssets={comparisonAssets}
          allAssets={assetsList}
          onAddAsset={handleAddComparisonAsset}
          onRemoveAsset={handleRemoveComparisonAsset}
        />
      )}
    </div>
  );
};
