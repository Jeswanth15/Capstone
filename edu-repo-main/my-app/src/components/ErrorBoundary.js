import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: "16px 20px",
          margin: "16px",
          borderRadius: "12px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#f87171",
          fontFamily: "sans-serif",
          fontSize: "14px",
        }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#ef4444" }}>
            ⚠️ Component Error Caught
          </h4>
          <p style={{ margin: 0, opacity: 0.85 }}>
            {this.state.error?.message || "An unexpected error occurred while rendering."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: "12px",
              padding: "6px 14px",
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600
            }}
          >
            Retry Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
