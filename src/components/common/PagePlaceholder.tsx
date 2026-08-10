import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export interface PagePlaceholderProps {
  title: string;
  description: string;
  sprintMilestone: string;
  plannedFeatures: string[];
  icon: React.ReactNode;
}

export const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  title,
  description,
  sprintMilestone,
  plannedFeatures,
  icon,
}) => {
  const { toggleAICopilot } = useAppStore();

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <GlassCard elevation={2} className="p-8 border-sky-500/20 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                <Badge variant="info">{sprintMilestone}</Badge>
              </div>
              <p className="text-sm text-zinc-400 max-w-2xl">{description}</p>
            </div>
          </div>

          <Button
            variant="glass"
            leftIcon={<Sparkles className="w-4 h-4 text-sky-400" />}
            onClick={toggleAICopilot}
            className="shrink-0"
          >
            Ask Gemini AI
          </Button>
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <span>Sprint Execution Roadmap & Scope</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plannedFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-300 font-mono leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-sky-950/20 border border-sky-500/20 rounded-lg flex items-center justify-between text-xs font-mono text-sky-300">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Architecture & Routing Ready — Business logic scheduled for upcoming Sprint.</span>
          </span>
          <span className="text-zinc-500 hidden sm:inline">Nolyvatix Core v1.0</span>
        </div>
      </GlassCard>
    </div>
  );
};
