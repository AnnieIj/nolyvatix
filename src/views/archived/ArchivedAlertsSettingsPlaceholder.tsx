/**
 * ARCHIVED: Sprint 8 Placeholder for Alerts & Settings
 * Replaced in production by /src/views/AlertCenterView.tsx
 */
import React from 'react';
import { WorkspaceHeader } from '../../components/layout/WorkspaceHeader';
import { PagePlaceholder } from '../../components/common/PagePlaceholder';
import { Bell } from 'lucide-react';

export const ArchivedAlertsSettingsPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title="Alerts & Webhooks Engine"
        subtitle="Real-Time Automated Triggers, Discord/Slack Webhooks & On-Chain Guardrails"
      />
      <PagePlaceholder
        title="Automated Alerting & Webhook Dispatcher"
        sprintMilestone="Sprint 8 Scheduled Deliverable"
        description="Set custom threshold rules for transaction volume spikes, Soroban contract gas anomalies, or anchor latency drops."
        icon={<Bell className="w-6 h-6" />}
        plannedFeatures={[
          'Threshold Trigger Builder (TPS, Soroban Gas, Volume)',
          'Discord & Slack Webhook Integration Channels',
          'On-Chain Anomaly Detection Guardrails',
        ]}
      />
    </div>
  );
};
