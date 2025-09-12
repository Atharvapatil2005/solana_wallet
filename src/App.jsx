import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletPanel from './components/WalletPanel.jsx';
import SendForm from './components/SendForm.jsx';
import TxHistory from './components/TxHistory.jsx';

export default function App() {
  const rpcUrl = `http://${window.location.hostname}:8899`;
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Solana Wallet</h1>
          <p className="text-sm text-red-600 mt-1">For demo only — keys are not stored securely.</p>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-700">
              <span className="font-medium">RPC URL:</span> {rpcUrl}
            </p>
          </div>
        </header>
        <main className="space-y-6">
          <WalletPanel />
          <SendForm />
          <TxHistory />
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}


