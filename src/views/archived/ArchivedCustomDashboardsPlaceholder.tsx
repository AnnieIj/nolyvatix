/**
 * ARCHIVED: Sprint 7 Placeholder for Custom Dashboards
 * Replaced in production by /src/views/DashboardBuilderView.tsx
 */
import React from 'react';
import { WorkspaceHeader } from '../../components/layout/WorkspaceHeader';
import { PagePlaceholder } from '../../components/common/PagePlaceholder';
import { Grid3X3 } from 'lucide-react';

export const ArchivedCustomDashboardsPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title="Custom BI Dashboards"
        subtitle="Drag-and-Drop Widget Grid Engine & Saved User Workspaces"
      />
      <PagePlaceholder
        title="Interactive Drag-and-Drop Dashboard Builder"
        sprintMilestone="Sprint 7 Scheduled Deliverable"
        description="Design bespoke Business Intelligence dashboards using customizable metric cards, time-series graphs, and pie charts."
        icon={<Grid3X3 className="w-6 h-6" />}
        plannedFeatures={[
          'Drag-and-Drop 12-Column Responsive Grid System',
          'Custom Metric Cards, Area Charts, & Data Tables',
          'Persistent Dashboard Layouts in PostgreSQL',
        ]}
      />
    </div>
  );
};
