import React from "react";
import { Link } from "react-router-dom";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="eb-page">
        <div className="eb-content">
          <div className="eb-icon">!</div>
          <h1>Something went wrong</h1>
          <p>
            An unexpected error occurred. Our team has been notified.
            Please try refreshing the page or return to the homepage.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="eb-stack">
              {this.state.error.toString()}
            </pre>
          )}

          <div className="eb-actions">
            <button
              className="eb-btn primary"
              onClick={() => {
                this.handleReset();
                window.location.href = "/";
              }}
            >
              Return Home
            </button>
            <button
              className="eb-btn secondary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
