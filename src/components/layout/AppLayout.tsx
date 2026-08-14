import React from 'react';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';
import { Footer } from './Footer';
import { GeminiAICopilotDrawer } from '../ai/GeminiAICopilotDrawer';
import { ErrorBoundary } from '../common/ErrorBoundary';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased bg-grid-pattern">
      <div className="flex flex-1 w-full relative">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Application Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Bar */}
          <AppHeader />

          {/* Page Workspace View */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>

          {/* Footer Bar */}
          <Footer />
        </div>
      </div>

      {/* Side-Drawer AI Co-Pilot Assistant */}
      <GeminiAICopilotDrawer />
    </div>
  );
};
