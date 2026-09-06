"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

type BoundaryProps = {
  children: ReactNode;
  onReset: () => void;
};

type BoundaryState = { error: Error | null };

class QueryIslandBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[QueryIsland]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="text-sm text-destructive">
          <p>{this.state.error.message}</p>
          <button
            type="button"
            className="underline"
            onClick={() => {
              this.props.onReset();
              this.setState({ error: null });
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function QueryIsland({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <QueryIslandBoundary onReset={reset}>{children}</QueryIslandBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
