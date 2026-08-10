import React, { useState, useEffect } from 'react';
import { geminiService, AIRecommendationItem } from '../../services/api/gemini';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles, ShieldAlert, TrendingUp, Cpu, Coins, RefreshCw, ArrowUpRight } from 'lucide-react';

export const AiRecommendationsSection: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const loadRecs = async () => {
    setIsLoading(true);
    try {
      const data = await geminiService.fetchRecommendations();
      setRecommendations(data);
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecs();
  }, []);

  const categories = ['All', 'Soroban', 'Liquidity', 'Assets', 'Risk'];

  const filtered =
    activeCategory === 'All' ? recommendations : recommendations.filter((r) => r.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 bg-zinc-900/60 border-zinc-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AI Recommendations & Ecosystem Insights Engine
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Proactive anomaly detection, liquidity optimization & Soroban gas refactoring suggestions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                activeCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={loadRecs} className="ml-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Card>

      {/* Recommendations List */}
      {isLoading ? (
        <Card className="p-12 text-center bg-zinc-900/60 border-zinc-800 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-sm font-mono text-zinc-300">Synthesizing live ledger insights & WASM metrics...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="p-5 bg-zinc-900/80 border-zinc-800 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="info" className="font-mono text-[10px]">
                    {item.category}
                  </Badge>
                  <Badge
                    variant={item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'neutral'}
                    className="font-mono text-[10px]"
                  >
                    {item.priority} Priority
                  </Badge>
                </div>
                {item.metricValue && (
                  <span className="text-xs font-mono font-semibold text-sky-400">
                    {item.metricValue} ({item.trend})
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
                  <span>{item.title}</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.description}</p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-semibold block uppercase">
                  Actionable AI Insight:
                </span>
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">{item.actionableInsight}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
