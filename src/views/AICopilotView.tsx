import React, { useState } from 'react';
import { WorkspaceHeader } from '../components/layout/WorkspaceHeader';
import { Card } from '../components/ui/Card';
import { CopilotChatSection } from '../components/ai/CopilotChatSection';
import { ExecutiveSummarySection } from '../components/ai/ExecutiveSummarySection';
import { AiChartGeneratorSection } from '../components/ai/AiChartGeneratorSection';
import { EntityExplainerSection } from '../components/ai/EntityExplainerSection';
import { AiRecommendationsSection } from '../components/ai/AiRecommendationsSection';
import { Sparkles, MessageSquare, FileText, BarChart2, Search, Lightbulb } from 'lucide-react';

export const AICopilotView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'copilot' | 'executive' | 'chart' | 'explainer' | 'recommendations'>('copilot');

  const tabs = [
    { id: 'copilot' as const, label: 'AI Copilot Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'executive' as const, label: 'Executive Digest', icon: <FileText className="w-4 h-4" /> },
    { id: 'chart' as const, label: 'AI Chart Engine', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'explainer' as const, label: 'Entity Explainer', icon: <Search className="w-4 h-4" /> },
    { id: 'recommendations' as const, label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title="Nolyvatix Gemini AI Intelligence Platform"
        subtitle="Enterprise Natural Language BI, Executive Summaries, Soroban APM Diagnosis & Custom Chart Engine"
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {activeTab === 'copilot' && <CopilotChatSection />}
        {activeTab === 'executive' && <ExecutiveSummarySection />}
        {activeTab === 'chart' && <AiChartGeneratorSection />}
        {activeTab === 'explainer' && <EntityExplainerSection />}
        {activeTab === 'recommendations' && <AiRecommendationsSection />}
      </div>
    </div>
  );
};
