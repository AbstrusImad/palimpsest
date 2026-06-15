'use client';

import { Component, ReactNode } from 'react';
import { ErrorState } from './States';

export interface DataErrorBoundaryProps {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

// Catches render-time failures in data sections so the nav, hero, and static
// prose still render. Read failures themselves are handled inside the hooks.
export class DataErrorBoundary extends Component<DataErrorBoundaryProps, State> {
  constructor(props: DataErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: String((error as { message?: string })?.message ?? error) };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-6">
          <ErrorState
            message={this.state.message || 'Something failed while rendering this section.'}
            onRetry={this.reset}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
