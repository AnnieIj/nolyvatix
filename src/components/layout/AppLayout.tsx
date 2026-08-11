import React from 'react';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';
import { Footer } from './Footer';
import { GeminiAICopilotDrawer } from '../ai/GeminiAICopilotDrawer';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { DemoModeBanner } from '../common/DemoModeBanner';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased bg-grid-pattern">
      {/* Skip Navigation Link — visible on keyboard focus only */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-sky-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <div className="flex flex-1 w-full relative">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Application Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Bar */}
          <AppHeader />

          {/* Fallback / Demo Mode Alert Banner */}
          <DemoModeBanner />

          {/* Page Workspace View */}
          <main id="main-content" role="main" className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
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
