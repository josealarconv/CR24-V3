import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error no capturado en la aplicación:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#09090b', color: '#f4f4f5', minHeight: '100vh', textFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f43f5e' }}>Error de Inicialización</h2>
          <p style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>
            {this.state.error?.message || 'Ocurrió un problema al renderizar la aplicación.'}
          </p>
          <pre style={{ fontSize: '11px', color: '#71717a', marginTop: '12px', maxHeight: '200px', overflow: 'auto', background: '#18181b', padding: '12px', borderRadius: '8px' }}>
            {this.state.error?.stack || ''}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Recargar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
