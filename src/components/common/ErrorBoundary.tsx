import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error || new Error('Runtime error caught'));
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950 border border-rose-500/30 rounded-xl my-4">
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-mono">Workspace Execution Error</h2>
        <p className="text-sm text-zinc-400 max-w-md mb-6 font-mono">
          {error?.message || 'An unexpected telemetry error occurred.'}
        </p>
        <Button
          variant="secondary"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={() => {
            setHasError(false);
            setError(null);
            window.location.reload();
          }}
        >
          Reload Platform Workspace
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
