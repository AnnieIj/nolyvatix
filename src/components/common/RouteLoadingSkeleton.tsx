import React from 'react';

export const RouteLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-[1600px] mx-auto" aria-busy="true" aria-live="polite">
      {/* Header Skeleton */}
      <div className="h-14 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="w-36 h-4 bg-zinc-800 rounded" />
            <div className="w-64 h-3 bg-zinc-800/60 rounded hidden sm:block" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-20 h-7 bg-zinc-800 rounded-md" />
          <div className="w-24 h-7 bg-zinc-800 rounded-md" />
        </div>
      </div>

      {/* KPI Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-24 h-3 bg-zinc-800 rounded" />
              <div className="w-6 h-6 rounded-md bg-zinc-800" />
            </div>
            <div className="w-32 h-7 bg-zinc-800 rounded" />
            <div className="w-20 h-3 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div className="w-40 h-5 bg-zinc-800 rounded" />
            <div className="w-24 h-4 bg-zinc-800 rounded" />
          </div>
          <div className="w-full h-64 bg-zinc-800/40 rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
          </div>
        </div>

        <div className="h-96 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 space-y-4">
          <div className="w-32 h-5 bg-zinc-800 rounded pb-4 border-b border-zinc-800" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-zinc-850/60 rounded-lg p-3 flex items-center justify-between">
              <div className="w-28 h-3.5 bg-zinc-800 rounded" />
              <div className="w-16 h-3 bg-zinc-800/80 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
