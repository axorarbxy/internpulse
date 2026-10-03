import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
            background: '#fff8dc',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <section
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '32px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#0f3c65',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '13.2px',
              }}
            >
              InternPulse
            </p>

            <h1
              style={{
                margin: '12px 0',
                color: '#0f3c65',
                fontSize: '28.6px',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                margin: '0 0 12px',
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              We could not load this page. Please reload the application and try again.
            </p>

            <p
              style={{
                margin: '0 0 24px',
                color: '#94a3b8',
                fontSize: '14.3px',
              }}
            >
              {this.state.errorMessage}
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '12px 18px',
                background: '#0f3c65',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Reload application
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}