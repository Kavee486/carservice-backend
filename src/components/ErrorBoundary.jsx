import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    this.setState({ error, info });
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <h2 className="text-xl font-bold text-red-600">Something went wrong.</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{String(this.state.error && this.state.error.toString())}</pre>
          {this.state.info && <details className="mt-2 text-xs text-gray-600"><summary>Stack</summary><pre className="whitespace-pre-wrap">{this.state.info.componentStack}</pre></details>}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
