import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AppProviders } from './providers.jsx';

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);

