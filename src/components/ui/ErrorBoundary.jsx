/**
 * @fileoverview Application-level Error Boundary.
 * Catches any unhandled JavaScript errors in the component tree and
 * renders a friendly fallback instead of a blank screen.
 * @module components/ui/ErrorBoundary
 */

import { Component } from 'react';

/**
 * @typedef {object} ErrorBoundaryProps
 * @property {React.ReactNode} children
 * @property {React.ReactNode} [fallback] - Custom fallback UI.
 */

/**
 * @typedef {object} ErrorBoundaryState
 * @property {boolean} hasError
 * @property {Error|null} error
 */

export class ErrorBoundary extends Component {
  /** @param {ErrorBoundaryProps} props */
  constructor(props) {
    super(props);
    /** @type {ErrorBoundaryState} */
    this.state = { hasError: false, error: null };
  }

  /**
   * @param {Error} error
   * @returns {ErrorBoundaryState}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * @param {Error} error
   * @param {React.ErrorInfo} info
   */
  componentDidCatch(error, info) {
    // Log to console; in production this could post to an error tracking service
    console.error('[EcoMirror ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.href = '/';
    } catch {
      // fallback
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0e1a',
            color: '#f0f4ff',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            padding: '2rem',
            gap: '1.5rem',
          }}
        >
          <div style={{ fontSize: '4rem' }} aria-hidden="true">🌍</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f4ff' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#8892a8', maxWidth: '480px', lineHeight: 1.7 }}>
            EcoMirror encountered an unexpected error. Your data is safe — it is
            stored locally on your device.
          </p>
          {this.state.error && (
            <details style={{ color: '#4a5568', fontSize: '0.8rem', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#8892a8' }}>
                Error details
              </summary>
              <pre style={{ marginTop: '0.5rem', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #00a885, #1af5a0)',
              color: '#0a0e1a',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
