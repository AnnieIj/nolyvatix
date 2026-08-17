import React, { useState, useEffect } from 'react';
import { UserWorkspace } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store/useAppStore';
import { authFetch } from '../lib/apiClient';
import {
  Briefcase,
  Grid3X3,
  FileText,
  Sparkles,
  Pin,
  Search,
  Wallet,
  Cpu,
  ArrowRightLeft,
  ExternalLink,
  Trash2,
} from 'lucide-react';

export const WorkspaceHubView: React.FC = () => {
  const [workspace, setWorkspace] = useState<UserWorkspace | null>(null);
  const { setActiveRoute } = useAppStore();

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    try {
      const res = await authFetch('/api/workspaces');
      if (res.ok) {
        const json = await res.json();
        setWorkspace(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
    }
  };

  const handleTogglePin = async (category: 'dashboards' | 'assets' | 'wallets' | 'contracts', itemId: string) => {
    try {
      const res = await authFetch('/api/workspaces/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, itemId }),
      });
      if (res.ok) {
        const json = await res.json();
        setWorkspace(json.data);
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Personal Workspace Hub</h1>
            <Badge variant="info">User Favorites & Pinned Entities</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Centralized hub for pinned dashboards, saved reports, bookmarked wallets, assets, and Soroban contracts.
          </p>
        </div>
      </div>

      {workspace && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Favorite Dashboards */}
          <GlassCard className="p-5 space-y-4 border-sky-500/20">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Grid3X3 className="w-4 h-4" />
                <span>Favorite Dashboards</span>
              </div>
              <Badge variant="info">{workspace.favoriteDashboards.length}</Badge>
            </div>

            <div className="space-y-2">
              {workspace.favoriteDashboards.map((dashId) => (
                <div
                  key={dashId}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between hover:border-sky-500/40 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white uppercase">{dashId}</div>
                    <span className="text-[10px] text-zinc-500">BI Custom View</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveRoute('dashboard-builder')}
                      className="p-1.5 text-zinc-400 hover:text-sky-400 transition-colors"
                      title="Open Dashboard"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Reports */}
          <GlassCard className="p-5 space-y-4 border-emerald-500/20">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <FileText className="w-4 h-4" />
                <span>Recent Reports</span>
              </div>
              <Badge variant="success">{workspace.recentReports.length}</Badge>
            </div>

            <div className="space-y-2">
              {workspace.recentReports.map((repId) => (
                <div
                  key={repId}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white uppercase">{repId}</div>
                    <span className="text-[10px] text-zinc-500">24-Hour BI Digest</span>
                  </div>
                  <button
                    onClick={() => setActiveRoute('report-builder')}
                    className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Saved AI Conversations */}
          <GlassCard className="p-5 space-y-4 border-purple-500/20">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Saved AI Conversations</span>
              </div>
              <Badge variant="info">{workspace.savedAIConversations.length}</Badge>
            </div>

            <div className="space-y-2">
              {workspace.savedAIConversations.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between hover:border-purple-500/40 transition-colors"
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-white truncate">{chat.title}</div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(chat.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveRoute('ai-copilot')}
                    className="p-1.5 text-zinc-400 hover:text-purple-400 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Pinned Assets */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Pinned Assets</span>
              </div>
              <Badge variant="warning">{workspace.pinnedAssets.length}</Badge>
            </div>

            <div className="space-y-2">
              {workspace.pinnedAssets.map((asset) => (
                <div
                  key={asset}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between"
                >
                  <span className="font-bold text-white">{asset}</span>
                  <button
                    onClick={() => handleTogglePin('assets', asset)}
                    className="text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Pinned Wallets */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Wallet className="w-4 h-4" />
                <span>Pinned Wallets</span>
              </div>
              <Badge variant="info">{workspace.pinnedWallets.length}</Badge>
            </div>

            <div className="space-y-2">
              {workspace.pinnedWallets.map((wallet) => (
                <div
                  key={wallet}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between"
                >
                  <span className="font-bold text-white truncate max-w-[200px]">{wallet}</span>
                  <button
                    onClick={() => handleTogglePin('wallets', wallet)}
                    className="text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Pinned Contracts */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Cpu className="w-4 h-4" />
                <span>Pinned Soroban Contracts</span>
              </div>
              <Badge variant="success">{workspace.pinnedContracts.length}</Badge>
            </div>

            <div className="space-y-2">
              {workspace.pinnedContracts.map((contract) => (
                <div
                  key={contract}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between"
                >
                  <span className="font-bold text-white truncate max-w-[200px]">{contract}</span>
                  <button
                    onClick={() => handleTogglePin('contracts', contract)}
                    className="text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
