import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/command-center';
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          id="error-boundary-container"
          className="min-h-[420px] w-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950/90 border border-rose-500/30 rounded-2xl my-6 shadow-2xl font-sans"
        >
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl mb-4 shadow-lg shadow-rose-950/40">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <span className="font-mono text-[11px] font-semibold px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30 mb-3">
            WORKSPACE_RUNTIME_ERROR
          </span>

          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
            Workspace Component Render Interrupted
          </h2>

          <p className="text-xs text-zinc-400 max-w-lg mb-6 font-mono leading-relaxed bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 text-left overflow-x-auto">
            {this.state.error?.message || 'An unexpected runtime error occurred during component rendering.'}
          </p>

          <div className="flex items-center gap-3">
            <Button
              id="error-boundary-reload-btn"
              variant="primary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={this.handleReset}
            >
              Reload Platform Workspace
            </Button>
            <Button
              id="error-boundary-home-btn"
              variant="secondary"
              leftIcon={<Home className="w-4 h-4" />}
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.hash = '#/command-center';
              }}
            >
              Command Center
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
