import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-neutral-400">{this.state.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


