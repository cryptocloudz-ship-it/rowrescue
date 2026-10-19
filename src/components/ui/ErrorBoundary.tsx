"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console only — no external services (privacy-first)
    console.error("SpreadsheetFix error boundary caught:", error.message);
    console.error("Component stack:", errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-rose-50 border border-rose-200 rounded-lg text-center">
          <AlertCircle className="w-10 h-10 text-rose-700 mb-3" />
          <h3 className="text-lg font-semibold text-rose-700">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h3>
          <p className="text-sm text-rose-700 mt-1 max-w-md font-medium">
            {this.state.error?.message ||
              "An unexpected error occurred while processing your data."}
          </p>
          <p className="text-xs text-ink-muted mt-2">
            Your data was not uploaded anywhere and remains safe in your browser.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
