import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, SafeAreaView } from 'react-native';
import ErrorCard from './ErrorCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center' }}>
          <ErrorCard 
            title="Component Error"
            message={this.state.error?.message || "An unexpected error occurred in this section."}
            onRetry={this.handleReset}
          />
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
