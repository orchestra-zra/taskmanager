import { Component, PropsWithChildren } from "react";
import ErrorState from "./ErrorState";

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * App-level error boundary. Without it, any render-phase throw unmounts the
 * whole React tree and leaves a permanent white screen (React 18 behavior).
 */
export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
